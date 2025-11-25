import { useEffect, useState } from "react";

export default function Login({ onLoginSuccess }) {
  const [accounts, setAccounts] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Link CSV
  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vS15h5EHpgjK-92wmtVhsVfFbS9cHhkOEzuWn2fggpZGnyT68DJ71B8ytlXCoU_po6Tj7s9GFt1WTRH/pub?gid=0&single=true&output=csv";

  // Load tài khoản từ Google Sheet
  useEffect(() => {
    fetch(CSV_URL)
      .then((res) => res.text())
      .then((csvText) => {
        const rows = csvText.split("\n").slice(1); // bỏ dòng tiêu đề
        const acc = rows
          .map((row) => row.trim())
          .filter((row) => row.length > 0)
          .map((row) => {
            const [u, p] = row.split(",");
            return { username: u?.trim(), password: p?.trim() };
          });

        setAccounts(acc);
      })
      .catch(() => setError("Không tải được danh sách tài khoản!"));
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    const found = accounts.find(
      (acc) => acc.username === username && acc.password === password
    );

    if (found) {
      localStorage.setItem("loggedIn", "yes");
      onLoginSuccess();
    } else {
      setError("Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">
          Đăng nhập hệ thống
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tài khoản
            </label>
            <input
              className="w-full px-4 py-2 border rounded-md"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tài khoản..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-lg font-semibold"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}
