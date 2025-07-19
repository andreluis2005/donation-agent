import { useEffect, useRef } from "react";

   interface DonationModalProps {
     isOpen: boolean;
     onConfirm: (value: boolean) => void;
     isDarkMode: boolean;
   }

   export default function DonationModal({ isOpen, onConfirm, isDarkMode }: DonationModalProps) {
     const modalRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
       const handleEscape = (event: KeyboardEvent) => {
         if (event.key === "Escape") {
           onConfirm(false);
         }
       };
       if (isOpen) {
         document.addEventListener("keydown", handleEscape);
         modalRef.current?.focus();
       }
       return () => {
         document.removeEventListener("keydown", handleEscape);
       };
     }, [isOpen, onConfirm]);

     if (!isOpen) return null;

     return (
       <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-all duration-300">
         <div
           ref={modalRef}
           role="dialog"
           aria-labelledby="donation-modal-title"
           tabIndex={-1}
           className={`w-full max-w-sm p-4 sm:p-6 rounded-xl bg-white/95 dark:bg-gray-800/95 text-gray-900 dark:text-gray-100 shadow-xl transition-all duration-300 transform ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
         >
           <h3 id="donation-modal-title" className="text-lg sm:text-xl font-semibold mb-4 text-center">
             Support the Developer
           </h3>
           <p className="text-sm sm:text-base text-center mb-4 text-gray-600 dark:text-gray-300">
             Would you like to donate 10% to the developer for project maintenance?
           </p>
           <div className="flex justify-center gap-3 flex-wrap">
             <button
               onClick={() => onConfirm(true)}
               className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
               aria-label="Yes, Donate"
             >
               Yes, Donate
             </button>
             <button
               onClick={() => onConfirm(false)}
               className="px-4 py-2 rounded-xl bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
               aria-label="No, Thanks"
             >
               No, Thanks
             </button>
           </div>
         </div>
       </div>
     );
   }