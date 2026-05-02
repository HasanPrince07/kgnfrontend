import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import { toast } from "react-toastify";
import { useEffect } from "react";

function Dashboard() {

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.message) {
            toast(location.state.message, { type: "success" });
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    return (
        <>
            <main id="admin-section">
                <div className="container-fluid">
                    <div className="row">
                        <Sidebar />
                        <div className="col-sm-9 admin-div d-flex align-items-center justify-content-center">
                            <h1 className="fw-bold text-uppercase m-0">welcome to dashboard</h1>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default Dashboard;