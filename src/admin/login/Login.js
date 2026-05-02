import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./login.css";

const INITIAL_STATE = { username: "", password: "" };

function Login() {

    const [login, setLogin] = useState(INITIAL_STATE);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target
        setLogin(prev => ({ ...prev, [name]: value }));
    };

    const handleForm = async (e) => {
        e.preventDefault();
        if (!login.username.trim() || !login.password.trim()) {
            setError(true);
            return
        }
        setLoading(true);
        try {
            const res = await fetch(`/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(login)
            });
            const resData = await res.json();
            if (res.ok) {
                navigate("/dashboard", { state: { message: resData.message } });
            } else {
                toast(resData.message, { type: "error" });
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during login:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <main id="login-section" className="d-flex align-items-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-sm-6 col-12 bg-light p-4">
                            <h2 className="text-center text-uppercase fw-bold">login</h2>
                            <form onSubmit={handleForm}>
                                <label className="mb-1">Username</label>
                                <input name="username" value={login.username} onChange={handleChange} type="text" className={`form-control shadow-none rounded-0 ${error && !login.username.trim() ? "error-input" : ""}`} />
                                <p className="my-1">{error && !login.username.trim() ? "Username is required" : ""}</p>
                                <label className="mb-1">Password</label>
                                <div className="d-flex">
                                    <input name="password" value={login.password} onChange={handleChange} type={showPassword ? "text" : "password"} className={`form-control shadow-none rounded-0 ${error && !login.password.trim() ? "error-input" : ""}`} />
                                    <button type="button" className="btn bg-white border rounded-0" onClick={() => setShowPassword(!showPassword)}>
                                        <img src={`/media/${showPassword ? "hidden.png" : "eye.png"}`} alt="toggle" />
                                    </button>
                                </div>
                                <p className="my-1">{error && !login.password.trim() ? "Password is required" : ""}</p>
                                <div className="d-flex mt-sm-2 mt-0">
                                    <button type="submit" disabled={loading} className="btn text-uppercase fw-bold shadow-none form-control rounded-0">{loading ? <><div className="spinner mx-auto"></div></> : "login"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default Login;