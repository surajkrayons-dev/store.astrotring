import { useDispatch, useSelector } from "react-redux";
import CartPage from "@/pages/CartPage";
import { closeCartDrawer } from "@/redux/slices/uiSlice";


const CartDrawer = () => {
  const dispatch = useDispatch();

  const { isCartDrawerOpen } = useSelector(
    (state) => state.ui
  );

  return (
    <>
      {/*cart Overlay */}
      <div
        onClick={() => dispatch(closeCartDrawer())}
        className={`
          fixed inset-0 scrollbar-hide bg-black/40 z-40
          transition-all duration-300
          ${
            isCartDrawerOpen
              ? "opacity-100 visible"
              : "opacity-0 invisible"
          }
        `}
      />

      {/*cart Drawer */}
      <div
        className={`
          fixed scrollbar-hide top-0 right-0 h-screen
          w-full sm:w-[60%]
          bg-white z-50 overflow-y-auto
          shadow-2xl
          transition-transform duration-300 ease-in-out
          ${
            isCartDrawerOpen
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
      >
        <CartPage />
      </div>
    </>
  );
};

export default CartDrawer;