import React from "react";
import { useNavigate } from "react-router-dom";
import { brandingData, categoriesData } from "../../../static/data";
import styles from "../../../styles/styles";

const Categories = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className={`${styles.section} hidden sm:block`}>
        <div className="branding my-12 grid w-full grid-cols-4 gap-5 rounded-2xl border border-[#e9e4db] bg-white p-6 shadow-sm">
          {brandingData &&
            brandingData.map((i, index) => (
              <div className="flex items-start" key={index}>
                {i.icon}
                <div className="px-3">
                  <h3 className="font-bold text-sm md:text-base">{i.title}</h3>
                  <p className="text-xs md:text-sm">{i.Description}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div
        className={`${styles.section} storefront-category-panel mb-16 rounded-[28px] border border-[#e9e4db] bg-white p-6 md:p-9`}
        id="categories"
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-5">
          {categoriesData &&
            categoriesData.map((i) => {
              const handleSubmit = (i) => {
                navigate(`/products?category=${i.title}`);
              };
              return (
                <div
                  className="storefront-category-tile flex h-[112px] w-full cursor-pointer items-center justify-between overflow-hidden rounded-2xl px-4 md:h-[142px] md:px-5"
                  key={i.id}
                  onClick={() => handleSubmit(i)}
                >
                  <h5 className="max-w-[95px] text-sm font-semibold leading-snug text-[#28352d] md:text-base">{i.title}</h5>
                  <img
                    src={i.image_Url}
                    className="w-[82px] object-cover transition-transform duration-500 md:w-[112px]"
                    alt=""
                  />
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};

export default Categories;
