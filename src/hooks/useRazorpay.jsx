export function useRazorpay() {
  async function load() {
    if (window.Razorpay) return;
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("razorpay_load_failed"));
      document.body.appendChild(s);
    });
  }

  function openCheckout(options) {
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return { load, openCheckout };
}
