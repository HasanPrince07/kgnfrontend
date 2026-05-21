import { useState } from "react";
import { toast } from "react-toastify";
import "./reset.css";
import { useParams } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const INITIAL_STATE = { newpass: "", cpass: "" };

function Reset() {
    const { id } = useParams();

    const [reset, setReset] = useState(INITIAL_STATE);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target
        setReset(prev => ({ ...prev, [name]: value }));
    };

    const handleForm = async (e) => {
        e.preventDefault();
        if (!reset.newpass.trim() || !reset.cpass.trim()) {
            setError(true);
            return
        }
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/admin/reset/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(reset)
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
            <main id="reset-section" className="d-flex align-items-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-sm-6 col-12 bg-light p-4">
                            <h2 className="text-center text-uppercase fw-bold">reset password</h2>
                            <form onSubmit={handleForm}>
                                <label className="mb-1 mt-sm-1 mt-3">New password</label>
                                <input name="newpass" type="text" value={reset.newpass} onChange={handleChange} className={`form-control shadow-none rounded-0 ${error && !reset.newpass.trim() ? "error-input" : ""}`} />
                                <p className="my-1">{error && !reset.newpass.trim() ? "New password is required" : ""}</p>
                                <label className="mb-1">Re-enter password</label>
                                <input name="cpass" type="text" value={reset.cpass} onChange={handleChange} className={`form-control shadow-none rounded-0 ${error && !reset.cpass.trim() ? "error-input" : ""}`} />
                                <p className="my-1">{error && !reset.cpass.trim() ? "Re-enter password is required" : ""}</p>
                                <div className="d-flex mt-sm-2 mt-0">
                                    <button type="submit" disabled={loading} className="btn text-uppercase fw-bold shadow-none form-control rounded-0">{loading ? <><div className="spinner mx-auto"></div></> : "continue"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default Reset;
