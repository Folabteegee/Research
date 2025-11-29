import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ZoteroProvider } from "@/context/ZoteroContext";
import { LibraryProvider } from "@/context/LibraryContext";
import { ApiProvider } from "@/context/ApiContext";
import { SyncInitializer } from "@/components/SyncInitializer";

export const metadata = {
  title: "Gurusearch",
  description:
    "Revolutionize Your Academic Journey with AI-Powered Research Excellence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
        <AuthProvider>
          <ThemeProvider>
            <ZoteroProvider>
              <LibraryProvider>
                <ApiProvider>
                  {/* Move SyncInitializer INSIDE all providers but AFTER AuthProvider */}
                  <SyncInitializer>
                    <main className="">{children}</main>
                  </SyncInitializer>
                </ApiProvider>
              </LibraryProvider>
            </ZoteroProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

// with google language selector but ugly

// import "./globals.css";
// import { AuthProvider } from "@/context/AuthContext";
// import { ThemeProvider } from "@/context/ThemeContext";
// import { ZoteroProvider } from "@/context/ZoteroContext";
// import { LibraryProvider } from "@/context/LibraryContext";
// import { ApiProvider } from "@/context/ApiContext";

// export const metadata = {
//   title: "Zotero x OpenAlex App",
//   description:
//     "A modern academic research companion powered by Zotero and OpenAlex.",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         {/* Google Translate Script with Compact Styling */}
//         <script
//           dangerouslySetInnerHTML={{
//             __html: `
//               function googleTranslateElementInit() {
//                 new google.translate.TranslateElement({
//                   pageLanguage: 'en',
//                   includedLanguages: 'es,fr,de,zh,ja,ko,ru,ar,hi,pt,it,nl,pl,tr,vi,th',
//                   layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
//                   autoDisplay: false,
//                   multilanguagePage: true
//                 }, 'google_translate_element');

//                 // Custom styling for the Google Translate widget
//                 const style = document.createElement('style');
//                 style.textContent = \`
//                   /* Hide Google's branding */
//                   .goog-te-banner-frame, .goog-te-ftab-link, .goog-te-gadget-simple .goog-te-menu-value span:last-child {
//                     display: none !important;
//                   }

//                   /* Style the language selector - COMPACT */
//                   .goog-te-gadget-simple {
//                     background: #49BBBD !important;
//                     border: none !important;
//                     border-radius: 8px !important;
//                     padding: 6px 10px !important;
//                     font-family: inherit !important;
//                     font-size: 12px !important;
//                     color: white !important;
//                     cursor: pointer !important;
//                     transition: all 0.2s ease !important;
//                     box-shadow: 0 2px 8px rgba(73, 187, 189, 0.3) !important;
//                     min-width: auto !important;
//                     height: 28px !important;
//                     display: flex !important;
//                     align-items: center !important;
//                     justify-content: center !important;
//                   }

//                   .goog-te-gadget-simple:hover {
//                     transform: translateY(-1px) !important;
//                     box-shadow: 0 4px 12px rgba(73, 187, 189, 0.4) !important;
//                     background: #3aa8a9 !important;
//                   }

//                   .goog-te-gadget-simple .goog-te-menu-value {
//                     color: white !important;
//                     font-weight: 500 !important;
//                     font-size: 12px !important;
//                     display: flex !important;
//                     align-items: center !important;
//                     gap: 4px !important;
//                   }

//                   .goog-te-gadget-simple .goog-te-menu-value span:first-child {
//                     color: white !important;
//                     border: none !important;
//                     font-size: 12px !important;
//                   }

//                   .goog-te-gadget-simple .goog-te-menu-value span:first-child::before {
//                     content: "🌐" !important;
//                     margin-right: 4px !important;
//                     font-size: 12px !important;
//                   }

//                   /* Remove text, show only globe icon on desktop */
//                   @media (min-width: 768px) {
//                     .goog-te-gadget-simple .goog-te-menu-value span:first-child::after {
//                       content: "" !important;
//                     }
//                     .goog-te-gadget-simple {
//                       width: 32px !important;
//                       height: 32px !important;
//                       padding: 6px !important;
//                       border-radius: 50% !important;
//                     }
//                   }

//                   /* Style the dropdown */
//                   .goog-te-menu-frame {
//                     border-radius: 8px !important;
//                     border: none !important;
//                     box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
//                     backdrop-filter: blur(10px) !important;
//                     background: rgba(255, 255, 255, 0.98) !important;
//                     margin-top: 4px !important;
//                     min-width: 140px !important;
//                   }

//                   .goog-te-menu2 {
//                     background: transparent !important;
//                     border: none !important;
//                     max-height: 300px !important;
//                     overflow-y: auto !important;
//                   }

//                   .goog-te-menu2-item {
//                     padding: 8px 12px !important;
//                     border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
//                     color: #374151 !important;
//                     font-family: inherit !important;
//                     font-size: 12px !important;
//                     transition: all 0.2s ease !important;
//                     line-height: 1.2 !important;
//                   }

//                   .goog-te-menu2-item:hover {
//                     background: #49BBBD !important;
//                     color: white !important;
//                   }

//                   .goog-te-menu2-item:last-child {
//                     border-bottom: none !important;
//                   }

//                   .goog-te-menu2-item div {
//                     color: inherit !important;
//                     font-size: 12px !important;
//                   }

//                   /* Dark mode support */
//                   @media (prefers-color-scheme: dark) {
//                     .goog-te-menu-frame {
//                       background: rgba(31, 41, 55, 0.98) !important;
//                       border: 1px solid rgba(255, 255, 255, 0.1) !important;
//                     }

//                     .goog-te-menu2-item {
//                       color: #D1D5DB !important;
//                       border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
//                     }

//                     .goog-te-menu2-item:hover {
//                       background: #49BBBD !important;
//                       color: white !important;
//                     }
//                   }

//                   /* Hide the original iframe */
//                   .goog-te-banner-frame {
//                     display: none !important;
//                   }

//                   .skiptranslate iframe {
//                     display: none !important;
//                   }

//                   /* Compact custom label */
//                   #custom_language_label {
//                     background: rgba(73, 187, 189, 0.1);
//                     backdrop-filter: blur(10px);
//                     border: 1px solid rgba(73, 187, 189, 0.2);
//                     border-radius: 6px;
//                     padding: 2px 8px;
//                     font-size: 10px;
//                     color: #49BBBD;
//                     font-weight: 500;
//                     margin-bottom: 4px;
//                   }
//                 \`;
//                 document.head.appendChild(style);

//                 // Add compact custom container
//                 setTimeout(() => {
//                   const translateElement = document.getElementById('google_translate_element');
//                   if (translateElement) {
//                     const customLabel = document.createElement('div');
//                     customLabel.innerHTML = \`
//                       <div style="
//                         position: fixed;
//                         top: 12px;
//                         right: 12px;
//                         z-index: 10000;
//                         display: flex;
//                         flex-direction: column;
//                         align-items: flex-end;
//                         gap: 2px;
//                       ">
//                         <div id="custom_language_label">Lang</div>
//                         <div id="custom_translate_element" style="display: flex; justify-content: flex-end;"></div>
//                       </div>
//                     \`;
//                     document.body.appendChild(customLabel);

//                     // Move the Google Translate element to our custom container
//                     const googleElement = document.querySelector('.goog-te-gadget-simple');
//                     const customContainer = document.getElementById('custom_translate_element');
//                     if (googleElement && customContainer) {
//                       customContainer.appendChild(googleElement);

//                       // Make it even more compact on desktop
//                       if (window.innerWidth >= 768) {
//                         googleElement.style.width = '32px';
//                         googleElement.style.height = '32px';
//                         googleElement.style.padding = '6px';
//                         googleElement.style.borderRadius = '50%';
//                         const textSpan = googleElement.querySelector('.goog-te-menu-value span:first-child');
//                         if (textSpan) {
//                           textSpan.textContent = '';
//                         }
//                       }
//                     }
//                   }
//                 }, 1000);
//               }

//               // Handle page changes in Next.js
//               if (typeof window !== 'undefined') {
//                 let lastUrl = window.location.href;
//                 new MutationObserver(() => {
//                   const url = window.location.href;
//                   if (url !== lastUrl) {
//                     lastUrl = url;
//                     setTimeout(() => {
//                       if (window.google && window.google.translate) {
//                         const frame = document.querySelector('.goog-te-menu-frame');
//                         if (frame) frame.remove();
//                       }
//                     }, 100);
//                   }
//                 }).observe(document, { subtree: true, childList: true });
//               }
//             `,
//           }}
//         />
//         <script
//           src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
//           async
//         />
//       </head>
//       <body className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
//         {/* Compact Language Selector Container */}
//         <div
//           id="google_translate_element"
//           style={{
//             position: 'fixed',
//             top: '12px',
//             right: '12px',
//             zIndex: 10000,
//             opacity: 0
//           }}
//         ></div>

//         <AuthProvider>
//           <ThemeProvider>
//             <ZoteroProvider>
//               <LibraryProvider>
//                 <main className="">
//                   <ApiProvider>{children}</ApiProvider>
//                 </main>
//               </LibraryProvider>
//             </ZoteroProvider>
//           </ThemeProvider>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }
