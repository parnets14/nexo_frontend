import React, { useEffect, useRef } from 'react';

const PayUPayment = ({ paymentData, onSuccess, onFailure }) => {
  const formRef = useRef(null);

  useEffect(() => {
    if (paymentData && formRef.current) {
      // Auto-submit the form when payment data is available
      formRef.current.submit();
    }
  }, [paymentData]);

  if (!paymentData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Redirecting to Payment Gateway</h3>
          <p className="text-gray-600 text-sm">Please wait while we redirect you to secure payment page...</p>
        </div>

        {/* Hidden form for PayU */}
        <form
          ref={formRef}
          action={paymentData.action}
          method="post"
          style={{ display: 'none' }}
        >
          <input type="hidden" name="key" value={paymentData.key} />
          <input type="hidden" name="txnid" value={paymentData.txnid} />
          <input type="hidden" name="amount" value={paymentData.amount} />
          <input type="hidden" name="productinfo" value={paymentData.productinfo} />
          <input type="hidden" name="firstname" value={paymentData.firstname} />
          <input type="hidden" name="email" value={paymentData.email} />
          <input type="hidden" name="phone" value={paymentData.phone} />
          <input type="hidden" name="surl" value={paymentData.surl} />
          <input type="hidden" name="furl" value={paymentData.furl} />
          <input type="hidden" name="hash" value={paymentData.hash} />
        </form>
      </div>
    </div>
  );
};

export default PayUPayment;
