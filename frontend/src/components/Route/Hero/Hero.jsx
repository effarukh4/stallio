import React from "react";
import { FiArrowUpRight, FiCheck, FiHeart } from "react-icons/fi";
import { Link } from "react-router-dom";

const Hero = () => (
  <section className="storefront-hero">
    <div className="storefront-hero__inner">
      <div className="storefront-hero__copy">
        <div className="storefront-eyebrow">
          <span className="storefront-eyebrow__dot" />
          THE GOOD THINGS, GATHERED
        </div>
        <h1>
          Good finds.
          <br />
          <em>Good people.</em>
        </h1>
        <p>
          A thoughtful marketplace of independent makers and little shops
          worth knowing. Find your next everyday favorite.
        </p>
        <div className="storefront-hero__actions">
          <Link to="/products" className="storefront-button">
            Explore the collection <FiArrowUpRight aria-hidden="true" />
          </Link>
          <div className="storefront-social-proof">
              <div>
                <div className="storefront-social-proof__rating">
                  <FiHeart aria-hidden="true" /> <span>Independent shops, one lovely place</span>
                </div>
                <small>Discover the people behind the things</small>
              </div>
          </div>
        </div>
        <div className="storefront-hero__promise">
          <span><FiCheck aria-hidden="true" /> Thoughtfully made</span>
          <span><FiCheck aria-hidden="true" /> Independent sellers</span>
          <span><FiCheck aria-hidden="true" /> One lovely checkout</span>
        </div>
      </div>
      <div className="storefront-hero__visual">
        <div className="storefront-hero__image">
          <img
            src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1200&q=85"
            alt="Thoughtfully curated home goods and everyday objects"
          />
        </div>
        <div className="storefront-hero__image-note">
          <span>THE MAKER EDIT</span>
          <strong>Made to be<br />kept close.</strong>
          <Link to="/products" aria-label="Discover the maker edit">
            <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>
        <div className="storefront-hero__stamp" aria-hidden="true">
          <span>SHOP SMALL</span>
          <strong>♥</strong>
          <span>FEEL GOOD</span>
        </div>
      </div>
    </div>
    <div className="storefront-hero__bottom">
      <span>CURATED WITH CARE</span>
      <span>01 — 04</span>
    </div>
  </section>
);

export default Hero;
