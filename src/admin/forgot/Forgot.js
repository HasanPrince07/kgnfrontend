import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./forgot.css";

function Login() {

    const [email, setEmail] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleForm = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setError(true);
            return
        }
        setLoading(true);
        try {
            const res = await fetch(`/admin/forgot`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(email)
            });
            const resData = await res.json();
            if (res.ok) {
                toast(resData.message, { type: "success" });
            } else {
                toast(resData.message, { type: "error" });
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during forgot:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <main id="forgot-section" className="d-flex align-items-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-sm-6 col-12 bg-light p-4">
                            <h2 className="text-center text-uppercase fw-bold">forgot password</h2>
                            <p className="text-center description-text">Enter your email and we'll send you a link to reset your password</p>
                            <form onSubmit={handleForm}>
                                <label className="mb-1 mt-sm-1 mt-3">Email</label>
                                <input name="username" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`form-control shadow-none rounded-0 ${error && !email.trim() ? "error-input" : ""}`} />
                                <p className="my-1">{error && !email.trim() ? "Email is required" : ""}</p>
                                <div className="d-flex mt-sm-2 mt-0">
                                    <button type="submit" disabled={loading} className="btn text-uppercase fw-bold shadow-none form-control rounded-0">{loading ? <><div className="spinner mx-auto"></div></> : "submit"}</button>
                                </div>
                                <Link to="/login" className="d-flex justify-content-center mt-2">Back to login</Link>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default Login;