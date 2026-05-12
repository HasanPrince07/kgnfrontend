import { useNavigate } from "react-router-dom";

function Notfound() {

    const navigate = useNavigate();

    return (
        <>
            <main id="notfound-section" className="d-flex align-items-center">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <h1 className="fw-bold text-center">404</h1>
                            <h2 className="fw-bold text-center">Oops! This Page Not Found</h2>
                            <p className="text-center">The URL may be incorrect or this page no longer exists. Use the buttons below to go to the correct place.</p>
                        </div>
                       
                    </div>
                    <div className="row justify-content-center mt-sm-3 mt-2">
                        <div className="col-sm-3 col-5 p-0">
                            <button className="text-uppercase form-control rounded-0 fw-bold btn1" onClick={() => navigate("/")}>back to home</button>
                        </div>
                        <div className="col-sm-3 col-5 p-0">
                            <button className="text-uppercase form-control rounded-0 fw-bold btn2" onClick={() => navigate(-1)}>go back</button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default Notfound;
