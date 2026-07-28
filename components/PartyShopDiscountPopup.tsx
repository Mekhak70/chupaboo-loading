import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * 🎉 PARTY SHOP DISCOUNT POPUP
 * 
 * Այս PopUp-ը ցուցադրում է Party Shop-ի զեղչի մասին տեղեկություն
 * Այն ինքնաբերաբար բացվում է էջ բացվելուց 3 վայրկյան հետո
 * Օգտատերը կարող է փակել այն՝ սեղմելով "Հասկացա՛" կոճակը կամ ֆոնի վրա
 */
export const PartyShopDiscountPopup = () => {
  // 👁️ PopUp-ի տեսանելիության վիճակ
  const [isVisible, setIsVisible] = useState(false);
  
  // 🔄 Փակման անիմացիայի վիճակ
  const [isClosing, setIsClosing] = useState(false);

  // ⏱️ PopUp-ը բացվում է 3 վայրկյան հետո
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // ❌ PopUp-ը փակելու ֆունկցիա
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 400);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* ⚫ Մուգ ֆոն (backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* 📦 PopUp-ի հիմնական բովանդակությունը */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
              
              {/* 🟣 Վերևի գունավոր հատված - վերնագիր */}
              <div className="bg-gradient-to-r from-[#69429a] to-[#8b5cf6] p-6 text-center">
                <div className="text-5xl mb-2">🎉</div>
                <h2 className="text-2xl font-black text-white">
                  Party Shop Զեղչ
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Գնե՛ք տորթ և ստացե՛ք զեղչ մյուս ապրանքների վրա
                </p>
              </div>

              {/* 📋 Զեղչի մանրամասները */}
              <div className="p-6 space-y-4">
                
                {/* 10% զեղչի բլոկ */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Տորթի գինը</p>
                      <p className="text-xl font-bold text-gray-800">5,000 AMD-ից ավելի</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Զեղչ</p>
                      <p className="text-2xl font-black text-green-600">10%</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    🎯 5,000 դրամը գերազանցող տորթ գնելիս
                  </p>
                </div>

                {/* 20% զեղչի բլոկ */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Տորթի գինը</p>
                      <p className="text-xl font-bold text-gray-800">10,000 AMD-ից ավելի</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Զեղչ</p>
                      <p className="text-2xl font-black text-green-600">20%</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    🎯 10,000 դրամը գերազանցող տորթ գնելիս
                  </p>
                </div>

                {/* ℹ️ Լրացուցիչ տեղեկություն */}
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <p className="text-xs text-blue-700 text-center">
                    💡 Զեղչը կիրառվում է <strong>միայն ոչ-տորթ</strong> ապրանքների վրա
                  </p>
                </div>

                {/* ✅ Փակելու կոճակ */}
                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl bg-[#69429a] text-white font-semibold hover:bg-[#7c4fb3] transition-all shadow-md hover:shadow-lg"
                >
                  Հասկացա՛
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};