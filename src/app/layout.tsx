import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ZoteroProvider } from "@/context/ZoteroContext";
import { LibraryProvider } from "@/context/LibraryContext";
import { ApiProvider } from "@/context/ApiContext";
import { SyncInitializer } from "@/components/SyncInitializer";

export const metadata = {
  title: "Gurusearch - Groundbreaking Research in one Seamless Platform",
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
