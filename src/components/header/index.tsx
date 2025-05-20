import { createSignal } from "solid-js";

const pages = [
    { name: "Home", path: "/", public: true, private: true },
    { name: "About", path: "/about", public: true, private: true },
    { name: "Dashboard", path: "/dashboard", public: false, private: true },
    { name: "Contact", path: "/contact", public: true, private: true },
    { name: "Login", path: "/login", public: true, private: false },
    { name: "Register", path: "/register", public: true, private: false },
]

export default function Header() {
    const [connected, setConnected] = createSignal(false);
    const [user, setUser] = createSignal({ name: "John Doe" });
    

  return (
    <header class="bg-gray-800 text-white p-4">
      <nav class="flex justify-between items-center">
        <div class="text-lg font-bold">My App</div>
        <ul class="flex space-x-4">
          {pages.map((page) => {
            if (connected() && page.private) {
              return (
                <li>
                  <a href={page.path} class="hover:underline text-white">
                    {page.name}
                    </a>
                </li>
                );
            } else if (!connected() && page.public) {
                return (
                  <li>
                        <a href={page.path} class="hover:underline text-white">
                            {page.name}
                        </a>
                    </li>
                );
            } else {
                return null;
            }
            }
        )}
        </ul>
        <div class="flex items-center">
          {connected() ? (
            <>
              <span class="mr-4">Welcome, {user().name}</span>
              <button
                onClick={() => {
                  setConnected(false);
                  setUser({ name: "" });
                }}
                class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <p> 
                Bienvenue sur carwash, veuillez vous connecter ou vous inscrire
            </p>
          )}
        </div>
        </nav>
    </header>
    );
}