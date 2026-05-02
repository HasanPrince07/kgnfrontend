import { useCallback, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const NAV_LINKS = [
    { name: "dashboard", path: "dashboard" },
    { name: "user", path: "usermanagement" },
    { name: "main", path: "mainmanagement" },
    { name: "history", path: "historymanagement" },
    { name: "number", path: "numbermanagement" },
    { name: "certificate", path: "certificatemanagement" },
    { name: "policy", path: "policymanagement" },
    { name: "faqs", path: "faqsmanagement" },
    { name: "wallpaper", path: "wallpapermanagement" },
    { name: "about", path: "aboutmanagement" },
    { name: "product", path: "productmanagement" },
    { name: "career", path: "careermanagement" },
    { name: "apply", path: "applymanagement" },
    { name: "query", path: "querymanagement" },
    { name: "contact", path: "contactmanagement" },
]

function Adminheader() {
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const toggleModal = () => setModal(prev => !prev);
    const closeModal = () => setModal(false);

    const handleLogout = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/admin/logout`, {
                method: "GET",
                credentials: "include"
            });
            const resData = await res.json();
            if (!res.ok) {
                toast(resData.message, { type: "error" });
            } else {
                navigate("/login");
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during logout:", error);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    return (
        <>
            <section id="adminheader-section" className="position-sticky top-0 z-1 shadow-sm">
                <div className="container-fluid">
                    <div className="row align-items-center p-sm-3 p-2">
                        <div className="col-sm-2 col-4 pe-lg-4 pe-2">
                            <Link onClick={closeModal} to="/dashboard">
                                <img src="media/logo.webp" alt="company logo" fetchPriority="high" />
                            </Link>
                        </div>
                        <div className="col-8 d-sm-none d-flex justify-content-end">
                            <img onClick={toggleModal} className="menu" src="media/menu.png" alt="menu icon" />
                        </div>
                    </div>
                </div>
            </section>

            {modal && (
                <section id="headerModal-section" className="position-fixed top-0 bottom-0 start-0 end-0" onClick={closeModal}>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-6 headerModal-div px-0 py-2 shadow-lg" onClick={(e) => e.stopPropagation()}>
                                <div>
                                    {NAV_LINKS.map((link) => (
                                        <NavLink key={link.path} className="btn form-control text-uppercase fw-bold rounded-0 my-1" onClick={closeModal} to={`/${link.path}`}>{link.name}</NavLink>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <Link to="/login" onClick={handleLogout} id="logout-section" className="position-fixed z-1 text-decoration-none text-center fw-bold text-uppercase py-sm-2 py-1">{loading ? "loading..." : "logout"}</Link>
        </>
    );
}

export default Adminheader;