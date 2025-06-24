import { createSignal, onMount } from "solid-js";

const pages = [
    { name: "Home", path: "/", public: true, private: true },
    { name: "About", path: "/about", public: true, private: true },
    { name: "Dashboard", path: "/dashboard", public: false, private: true },
    { name: "Contact", path: "/contact", public: true, private: true },
    { name: "Profil", path: "/profil", public: true, private: false },
];

export default function Header() {
  const [connected, setConnected] = createSignal(false);
  const [user, setUser] = createSignal({ name: "John Doe" });
  const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);

  onMount(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setConnected(true);
      setUser(JSON.parse(storedUser));
    }
  });

  return (
    <header class="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          {/* Logo / App Name */}
          <div class="flex-shrink-0 flex items-center ">
            <a href="/" class="flex-shrink-0">
              <div class="flex items-center">
                <img
                  class="rounded-full h-10 w-10 mr-2"
                  src="/logo.jpg"
                  alt="CarWash Logo"
                />
                <span class="text-xl font-semibold tracking-tight">CarWash</span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div class="hidden md:flex md:items-center md:space-x-4">
            <div class="flex space-x-4">
              {/* Navigation Links */}
              {pages.map((page) => {
                if (connected() && page.private) {
                  return (
                    <a
                      href={page.path}
                      class="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition duration-150"
                    >
                      {page.name}
                    </a>
                  );
                } else if (!connected() && page.public) {
                  return (
                    <a
                      href={page.path}
                      class="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition duration-150"
                    >
                      {page.name}
                    </a>
                  );
                } else {
                  return null;
                }
              })}
            </div>

            {/* User section */}
            <div class="ml-4 flex items-center">
              {connected() ? (
                <div class="flex items-center">
                  <span class="px-3 py-2 rounded-md text-sm font-medium">
                    Welcome, {user().name}
                  </span>
                  <button
                    onClick={() => {
                      setConnected(false);
                      setUser({ name: "" });
                      localStorage.removeItem("user");
                      localStorage.removeItem("jwt");
                    }}
                    class="ml-4 px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div class="flex space-x-2">
                  <a
                    href="/login"
                    class="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                  >
                    Login
                  </a>
                  <a
                    href="/register"
                    class="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150"
                  >
                    Register
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div class="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen())}
              class="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span class="sr-only">Open main menu</span>
              {/* Icon for menu toggle */}
              <svg
                class="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen() ? (
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, toggle based on state */}
      <div class={`md:hidden ${mobileMenuOpen() ? "block" : "hidden"}`}>
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {pages.map((page) => {
            if (connected() && page.private) {
              return (
                <a
                  href={page.path}
                  class="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700"
                >
                  {page.name}
                </a>
              );
            } else if (!connected() && page.public) {
              return (
                <a
                  href={page.path}
                  class="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700"
                >
                  {page.name}
                </a>
              );
            } else {
              return null;
            }
          })}
        </div>
        <div class="pt-4 pb-3 border-t border-blue-700">
          {connected() ? (
            <div class="px-2 space-y-1">
              <div class="block px-3 py-2 rounded-md text-base font-medium text-white">
                Welcome, {user().name}
              </div>
              <button
                onClick={() => {
                  setConnected(false);
                  setUser({ name: "" });
                  localStorage.removeItem("user");
                  localStorage.removeItem("jwt");
                }}
                class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <div class="px-2 space-y-2">
              <a
                href="/login"
                class="block w-full px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Login
              </a>
              <a
                href="/register"
                class="block w-full px-3 py-2 rounded-md text-base font-medium text-white bg-gray-700 hover:bg-gray-600"
              >
                Register
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}