import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses, addAddress, updateAddress, deleteAddress, clearAddressError } from '../../redux/slices/addressSlice';
import { toast } from 'react-toastify';

const AddressManager = () => {
  const dispatch = useDispatch();
  const { addresses, loading, error } = useSelector((state) => state.address);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    country_code: '+91',
    mobile: '',
    alternative_mobile: '',
    address: '',
    pincode: '',
    is_default: false,
  });
  console.log("formdata",formData)

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAddressError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      country_code: '+91',
      mobile: '',
      alternative_mobile: '',
      address: '',
      pincode: '',
      is_default: false,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.mobile || !formData.address || !formData.pincode) {
      toast.error('Please fill all required fields');
      return;
    }

    // Prepare payload with correct types
    const payload = {
      name: formData.name,
      country_code: formData.country_code,
      mobile: formData.mobile,
      address: formData.address,
      pincode: formData.pincode,
      alternative_mobile: formData.alternative_mobile || null,
      is_default: formData.is_default ? 1 : 0, // convert boolean to integer (1/0)
    };

    console.log('Submitting address:', payload);

    if (editingId) {
      await dispatch(updateAddress({ id: editingId, addressData: payload })).unwrap();
      toast.success('Address updated');
    } else {
      await dispatch(addAddress(payload)).unwrap();
      toast.success('Address added');
    }
    resetForm();
  };

  const handleEdit = (address) => {
    console.log('Editing address:', address);
    setEditingId(address.id);

    setFormData({
      name: address.name || '',
      country_code: address.country_code || '+91',
      mobile: address.mobile || '',
      alternative_mobile: address.alternative_mobile || '',
      address: address.address || '',
      pincode: address.pincode || '',
      is_default: address.is_default === 1 || address.is_default === true, // normalize
    });
  };

const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this address?')) {
    try {
      await dispatch(deleteAddress(id)).unwrap();
      toast.success('Address deleted');
    } catch (err) {
      toast.error(err || 'Failed to delete address');
    }
  }
};

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Addresses</h2>

      {/* Address Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Address label (e.g., Home, Office)"
            value={formData.name}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="country_code"
            placeholder="Country Code (e.g., +91)"
            value={formData.country_code}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <input
            type="tel"
            name="alternative_mobile"
            placeholder="Alternate Mobile (optional)"
            value={formData.alternative_mobile}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="address"
            placeholder="Full Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
            />
            <span>Set as default</span>
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700">
            {editingId ? 'Update' : 'Add'} Address
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Address List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {addresses.map(addr => (
            <div key={addr.id} className="border p-4 rounded shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{addr.name}</p>
                  <p>Mobile: {addr.mobile}</p>
                  {addr.alternative_mobile && <p>Alt: {addr.alternative_mobile}</p>}
                  <p>{addr.address}</p>
                  <p>Pincode: {addr.pincode}</p>
                  <p>Country: {addr.country_code}</p>
                  {addr.is_default && <span className="text-green-600 text-sm font-semibold">Default</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(addr)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(addr.id)} className="text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {addresses.length === 0 && !loading && <p>No addresses saved. Add one above.</p>}
        </div>
      )}
    </div>
  );
};

export default AddressManager;