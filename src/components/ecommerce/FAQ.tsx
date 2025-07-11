import { useState } from "react";

// Define the TypeScript interface for FAQ items
interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

// Define the FAQ data
const faqData: FAQItem[] = [
  {
    id: 0,
    question: "Do I get free updates?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec quis magna ac nibh malesuada consectetur at vitae ipsum orem ipsum dolor sit amet, consectetur adipiscing elit nam fermentum, leo et lacinia accumsan."
  },
  {
    id: 1,
    question: "Can I Customize TailAdmin to suit my needs?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec quis magna ac nibh malesuada consectetur at vitae ipsum orem ipsum dolor sit amet, consectetur adipiscing elit nam fermentum, leo et lacinia accumsan."
  },
  {
    id: 2,
    question: 'What does "Unlimited Projects" mean?',
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec quis magna ac nibh malesuada consectetur at vitae ipsum orem ipsum dolor sit amet, consectetur adipiscing elit nam fermentum, leo et lacinia accumsan."
  }
];

export default function FAQ() {
  const [openItem, setOpenItem] = useState<number | null>(0);

  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] h-full">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Faq's 1
        </h3>
      </div>
      <div className="border-t border-gray-100 p-4 dark:border-gray-800 sm:p-6">
        <div className="space-y-4">
          {faqData.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div
                onClick={() => toggleItem(item.id)}
                className={`flex items-center justify-between py-3 pl-6 pr-3 cursor-pointer ${
                  openItem === item.id ? "bg-gray-50 dark:bg-white/[0.03]" : ""
                }`}
              >
                <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
                  {item.question}
                </h4>

                <button
                  className={`flex h-12 w-full max-w-12 items-center justify-center rounded-full bg-gray-100 duration-200 ease-linear dark:bg-white/[0.03] ${
                    openItem === item.id
                      ? "text-gray-800 dark:text-white/90 rotate-180"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <svg
                    className="stroke-current"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.75 8.875L12 15.125L18.25 8.875"
                      stroke=""
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {openItem === item.id && (
                <div className="px-6 py-7">
                  <p className="text-base text-gray-500 dark:text-gray-400">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
