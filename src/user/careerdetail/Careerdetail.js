import Wallpaper from "../../common/Wallpaper";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./Careerdetail.css";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const INITIAL_STATE = { name: "", email: "", phone: "", message: "", file: null }
const WALLPAPER_INITIAL_STATE = { title: "", image: "" }

function Careerdetail() {
    const { id } = useParams();

    const [enquiry, setEnquiry] = useState(INITIAL_STATE);
    const [career, setCareer] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [wallpaper, setWallpaper] = useState(WALLPAPER_INITIAL_STATE);

    const fetchCareerById = useCallback(async () => {
        try {
            const results = await Promise.allSettled([
                fetch(`${BASE_URL}/user/fetchcareerbyid/${id}`).then(res => res.json()),
                fetch(`${BASE_URL}/user/fetchwallpaper/4`).then(res => res.json())
            ]);
            if (results[0].status === 'fulfilled' && results[0].value.data) {
                setCareer(results[0].value.data);
            } else {
                setCareer(null);
                console.log("Error in career:", results[0].value.message);
            }
            if (results[1].status === 'fulfilled' && results[1].value.data) {
                setWallpaper(results[1].value.data);
            } else {
                setWallpaper(WALLPAPER_INITIAL_STATE);
                console.log("Error in wallpaper:", results[1].value.message);
            }
        } catch (error) {
            console.log("Error during fetch career or wallpaper data:", error);
        }
    }, [id]);

    useEffect(() => { fetchCareerById(); }, [fetchCareerById]);

    const handleForm = async (e) => {
        e.preventDefault();
        const title = career.title
        const name = enquiry.name
        const email = enquiry.email
        const phone = enquiry.phone
        const message = enquiry.message
        const file = enquiry.file
        if (!enquiry.name.trim() || !enquiry.email.trim() || enquiry.phone.trim().length !== 10 || !enquiry.message.trim()) {
            setError(true);
            return
        }
        setLoading(true);
        try {
            const formdata = new FormData();
            formdata.append("title", title);
            formdata.append("name", name);
            formdata.append("email", email);
            formdata.append("phone", phone);
            formdata.append("message", message);
            formdata.append("file", file);
            const res = await fetch(`${BASE_URL}/user/addapply`, {
                method: "POST",
                body: formdata
            });
            const resData = await res.json();
            if (!res.ok) {
                toast(resData.message, { type: "error" });
            } else {
                toast(resData.message, { type: "success" });
            }
        } catch (error) {
            console.log("Error during apply:", error);
        } finally {
            handleReset();
            setLoading(false);
        }
    }

    function handleReset() {
        setEnquiry(INITIAL_STATE);
        setError(false);
    }

    function handlePhone(value) {
        const phoneNumber = value.replace(/\D/g, "");
        if (phoneNumber.length <= 10) {
            setEnquiry((prev) => ({
                ...prev,
                phone: phoneNumber
            }));
        }
    }

    const isPhoneValid = enquiry.phone.length === 10;
    const showLengthError = enquiry.phone.length > 0 && !isPhoneValid;
    const showRequiredError = error && !enquiry.phone;

    if (!career) return <h2 className="text-center my-5 py-5">Job not found.</h2>;

    return (
        <>
            {wallpaper.image ? (<Wallpaper heading={wallpaper.title} imgSrc={`${wallpaper.image}`} />) : null}

            <main>
                <section id="career-detail-section" className="my-lg-5 my-4 py-lg-5 py-4">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-sm-6 col-12">
                                {["title", "brief", "requirment", "salary", "location"].map((key) => (
                                    <div key={key}>
                                        <h2 className="text-uppercase fw-bold mb-sm-2 mb-1">job {key}</h2>
                                        <p className="mb-sm-4 mb-3">{career[key]}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="col-sm-6 col-12 border p-lg-5 p-sm-4 p-3 mt-sm-0 mt-3">
                                <h3 className="text-uppercase fw-bold mb-3">apply for this position</h3>
                                <form onSubmit={handleForm}>
                                    <label htmlFor="full-name" className="pb-1">Full Name</label>
                                    <input id="full-name" value={enquiry.name} onChange={(e) => setEnquiry((prev) => ({ ...prev, name: e.target.value }))} className={`form-control rounded-0 shadow-none py-2 ${error && !enquiry.name.trim() ? "error-input" : ""}`} type="text" />
                                    <p className="my-1">{error && !enquiry.name.trim() ? "Name is required" : ""}</p>
                                    <label htmlFor="email" className="pb-1">Email</label>
                                    <input id="email" value={enquiry.email} onChange={(e) => setEnquiry((prev) => ({ ...prev, email: e.target.value }))} className={`form-control rounded-0 shadow-none py-2 ${error && !enquiry.email.trim() ? "error-input" : ""}`} type="email" />
                                    <p className="my-1">{error && !enquiry.email.trim() ? "Email is required" : ""}</p>
                                    <label htmlFor="phone" className="pb-1">Phone</label>
                                    <input id="phone" value={enquiry.phone} onChange={(e) => handlePhone(e.target.value)} className={`form-control rounded-0 shadow-none py-2 ${(showRequiredError || showLengthError) ? "error-input" : ""}`} type="text" inputMode="numeric" />
                                    <p className="my-1">{showRequiredError ? "Phone number is required" : showLengthError ? "Phone number should be in 10 digit" : ""}</p>
                                    <label htmlFor="cover-letter" className="pb-1">Cover Letter</label>
                                    <textarea id="cover-letter" value={enquiry.message} onChange={(e) => setEnquiry((prev) => ({ ...prev, message: e.target.value }))} className={`form-control rounded-0 shadow-none py-2 ${error && !enquiry.message.trim() ? "error-input" : ""}`} rows={3}></textarea>
                                    <p className="my-1">{error && !enquiry.message.trim() ? "Cover letter is required" : ""}</p>
                                    <label htmlFor="resume" className="pb-1">Upload CV/Resume</label>
                                    <input id="resume" onChange={(e) => setEnquiry((prev) => ({ ...prev, file: e.target.files[0] }))} className="form-control rounded-0 shadow-none py-2" type="file" />
                                    <div className="d-flex justify-content-between mt-4">
                                        <button onClick={handleReset} type="reset" className="btn text-uppercase form-control shadow-none fw-bold rounded-0 me-2 px-5">reset</button>
                                        <button disabled={loading} type="submit" className="btn text-uppercase form-control shadow-none fw-bold rounded-0 ms-2 px-5">{loading ? <><div className="spinner mx-auto"></div></> : "apply"}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

export default Careerdetail;
