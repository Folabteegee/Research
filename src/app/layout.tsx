import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ZoteroProvider } from "@/context/ZoteroContext";
import { LibraryProvider } from "@/context/LibraryContext";
import { ApiProvider } from "@/context/ApiContext";

export const metadata = {
  title: "Zotero x OpenAlex App",
  description:
    "A modern academic research companion powered by Zotero and OpenAlex.",
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
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  <ApiProvider>{children}</ApiProvider>
                </main>
              </LibraryProvider>
            </ZoteroProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
