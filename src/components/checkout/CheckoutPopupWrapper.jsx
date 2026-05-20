import { useDispatch, useSelector } from "react-redux";
import CheckoutPopup from "@/components/checkout/CheckoutPopup";
import { closeCheckout } from "@/redux/slices/uiSlice";

const CheckoutPopupWrapper = () => {
  const dispatch = useDispatch();

  const { isCheckoutOpen } = useSelector(
    (state) => state.ui
  );

  return (
    <CheckoutPopup
      isOpen={isCheckoutOpen}
      onClose={() => dispatch(closeCheckout())}
    />
  );
};

export default CheckoutPopupWrapper;