import React from "react";
import {
  AiFillFacebook,
  AiFillInstagram,
  AiFillYoutube,
  AiOutlineTwitter,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import {
  footercompanyLinks,
  footerProductLinks,
  footerSupportLinks,
} from "../../static/data";

const Footer = () => {
  return (
    <footer className="storefront-footer bg-[#000] text-white">
      <div className="storefront-newsletter md:flex md:justify-between md:items-center sm:px-12 px-4 bg-[#342ac8] py-10">
        <h1 className="lg:text-4xl text-3xl md:mb-0 mb-6 lg:leading-normal font-medium md:w-2/5 font-[Fraunces]">
          <span className="text-[#e7b393]">A little good</span> in your inbox{" "}
          <br />
          events and offers
        </h1>
        <div>
          <input
            type="email"
            required
            placeholder="Enter your email..."
            className="text-gray-800
                sm:w-72 w-full sm:mr-3 mr-1 lg:mb-0 mb-4 py-3 rounded-lg px-3 focus:outline-none"
          />
          <button className="bg-[#d17a58] hover:bg-[#bd6b4c] duration-300 px-6 py-3 rounded-lg text-white font-semibold md:w-auto w-full">
            Sign me up
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:px-8 px-5 py-14 sm:text-center">
        <ul className="px-5 text-center sm:text-start flex sm:block flex-col items-center">
          <img
            src="/logo.svg"
            alt=""
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <br />
          <p className="max-w-[250px] text-sm leading-6 text-[#c3c9c0]">A home for independent shops, thoughtful finds, and the people behind them.</p>
          <div className="flex items-center mt-[15px]">
            <AiFillFacebook size={25} className="cursor-pointer" />
            <AiOutlineTwitter
              size={25}
              style={{ marginLeft: "15px", cursor: "pointer" }}
            />
            <AiFillInstagram
              size={25}
              style={{ marginLeft: "15px", cursor: "pointer" }}
            />
            <AiFillYoutube
              size={25}
              style={{ marginLeft: "15px", cursor: "pointer" }}
            />
          </div>
        </ul>

        <ul className="text-center sm:text-start">
          <h1 className="mb-1 font-semibold">Company</h1>
          {footerProductLinks.map((link,index) => (
            <li key={index}>
              <Link
                className="text-gray-400 hover:text-[#e7b393] duration-300
                   text-sm cursor-pointer leading-6"
                to={link.link}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="text-center sm:text-start">
          <h1 className="mb-1 font-semibold">Shop</h1>
          {footercompanyLinks.map((link,index) => (
            <li key={index}>
              <Link
                className="text-gray-400 hover:text-[#e7b393] duration-300
                   text-sm cursor-pointer leading-6"
                to={link.link}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="text-center sm:text-start">
          <h1 className="mb-1 font-semibold">Support</h1>
          {footerSupportLinks.map((link,index) => (
            <li key={index}>
              <Link
                className="text-gray-400 hover:text-[#e7b393] duration-300
                   text-sm cursor-pointer leading-6"
                to={link.link}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-white/10
         text-center pt-6 text-gray-400 text-sm pb-8 mx-5 sm:mx-8"
      >
        <span>© {new Date().getFullYear()} Stallio. All rights reserved.</span>
        <span>Terms · Privacy Policy</span>
        <div className="sm:block flex items-center justify-center w-full">
          <span>Secure payments via Stripe &amp; PayPal</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
