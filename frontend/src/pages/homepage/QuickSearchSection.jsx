import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

// Job QuickSearch Loop
const quickSearchData = [
  {
    heading: "Classifications",
    items: ["Accounting", "Education & Training", "Government & Defence"],
  },
  {
    heading: "Major City",
    items: ["Kyaunkpyu", "Myauk U", "Taungup", "Ann"],
  },
  {
    heading: "Other",
    items: ["All Jobs", "Admin Jobs", "Admin Jobs"],
  },
];

export default function QuickSearchSection() {
  // dropDown true and false
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  //   dropDown Data Loop
  const subOptions = ["Sub Option 1", "Sub Option 2", "Sub Option 3"];

  return (
    <section className="bg-[#f9fafb] border-t py-8">
      <div className="container mx-auto px-4">
        {/* Main Title Row */}
        <div className="py-6 text-center">
          <h2 className="gray-text-custom text-2xl font-bold">Quick Search</h2>
        </div>

        {/* Grid Columns */}
        <div className="grid md:grid-cols-3 gap-8">
          {quickSearchData.map((col, index) => (
            <div key={index} className="gap-8">
              {/* Heading */}
              <h4 className="font-semibold whitespace-nowrap gray-text-custom">{col.heading}</h4>

              {/* List Items */}
              <ul className="flex flex-row gap-5 flex-wrap my-4">
                {col.items.map((item, i) =>
                  item === "Government & Defence" ? (
                    // Dropdown Item
                    <li key={i} className="relative">
                      <button
                        onClick={toggleDropdown}
                        className="custom-blue-text hover-blue hover:underline flex items-center gap-1"
                      >
                        {item}
                        <ChevronDown className="mt-1" size={14} />
                      </button>

                      {/* dropDown data */}
                      {isOpen && (
                        <ul className="absolute left-0 top-8 w-40 z-10 bg-white">
                          {subOptions.map((option, index) => (
                            <li key={index}>
                              <a
                                href="#"
                                className="block px-4 py-2 text-sm custom-blue-text hover-blue hover:underline"
                              >
                                {option}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ) : (
                    // Normal Item
                    <li key={i}>
                      <a
                        href="#"
                        className="custom-blue-text hover-blue hover:underline"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
