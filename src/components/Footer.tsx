import { useEffect } from "react";

function Footer() {

  const BOTTOM_LEFT_CONTENT = window.APP_CONFIG.BOTTOM_LEFT_CONTENT;
  const BOTTOM_RIGHT_CONTENT = window.APP_CONFIG.BOTTOM_RIGHT_CONTENT;


  return (
    <footer>
      <div className="p-4 bg-gray-50 text-gray=800 font-semibold text-[12.5px] text-[#002734] md:text-sm text-center fixed bottom-0 w-full z-40 flex items-center justify-center md:justify-between px-16">
      <div className="hidden md:block">{BOTTOM_LEFT_CONTENT}</div>
        <div className="">
          Powered by MIS (Mercado Insight Solutions)
        </div> 
      <div className="hidden md:block">{BOTTOM_RIGHT_CONTENT}</div>
      </div>
    </footer>
  );
}

export default Footer;
