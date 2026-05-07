import Wallpaper from "../../common/Wallpaper";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./Contact.css";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const CONTACT_INITIAL_STATE = { image: "", phone: "", email: "", address: "", map: "" }
const CFORM_INITIAL_STATE = { cName: "", cEmail: "", cPhone: "", cMessage: "" }
const WALLPAPER_INITIAL_STATE = { title: "", image: "" }

function Contact() {

    const [cForm, setCForm] = useState(CFORM_INITIAL_STATE);
    const [contact, setContact] = useState(CONTACT_INITIAL_STATE);
    const [wallpaper, setWallpaper] = useState(WALLPAPER_INITIAL_STATE);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const results = await Promise.allSettled([
                fetch(`${BASE_URL}/user/fetchcontact`).then(res => res.json()),
                fetch(`${BASE_URL}/user/fetchwallpaper/5`).then(res => res.json())
            ]);
            if (results[0].status === 'fulfilled' && results[0].value.data) {
                setContact(results[0].value.data);
            } else {
                setContact(CONTACT_INITIAL_STATE);
                console.log("Error in contact:", results[0].value.message);
            }
            if (results[1].status === 'fulfilled' && results[1].value.data) {
                setWallpaper(results[1].value.data);
            } else {
                setWallpaper("");
                console.log("Error in wallpaper:", results[1].value.message);
            }
        } catch (error) {
            console.log("Error during fetch contact or wallpaper data:", error);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "cPhone" && value.length > 10) return;
        setCForm(prev => ({ ...prev, [name]: value }));
    };

    function handleReset() {
        setCForm(CFORM_INITIAL_STATE);
        setError(false);
    }

    const handleForm = async (e) => {
        e.preventDefault();
        const name = cForm.cName
        const email = cForm.cEmail
        const phone = cForm.cPhone
        const message = cForm.cMessage
        const formdata = { name, email, phone, message }
        if (!name.trim() || !email.trim() || phone.trim().length !== 10 || !message.trim()) {
            setError(true);
            return
        }
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/user/addquery`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formdata)
            });
            const resData = await res.json();
            if (!res.ok) {
                console.log(resData.message);
            } else {
                handleReset();
                toast("Query submitted successfully", { type: "success" });
            }
        } catch (error) {
            console.log("Error during submit query:", error);
        } finally {
            setLoading(false);
        }
    }

    const isPhoneValid = cForm.cPhone.length === 10;
    const showLengthError = cForm.cPhone.length > 0 && !isPhoneValid;
    const showRequiredError = error && !cForm.cPhone;

    const CONTACT_LINKS = [
        { icon: "media/phone-call.png", text: contact.phone, alt: "call icon" },
        { icon: "media/email2.png", text: contact.email, alt: "email icon" },
        { icon: "media/gps.png", text: contact.address, alt: "address icon" },
    ];

    return (
        <>
            {wallpaper.image ? (<Wallpaper heading={wallpaper.title} imgSrc={wallpaper.image} />) : null}
            <main>
                <section id="contact-page-section" className="my-lg-5 my-4 py-lg-5 py-4">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <h2 className="text-center text-uppercase fw-bold">any query</h2>
                            </div>
                        </div>
                        <div className="row align-items-center mt-lg-5 mt-4">
                            <div className="col-sm-6 px-lg-5 px-4">
                                {contact?.image && <img className="w-100 rounded-2" src={contact.image} alt="not-found" />}
                            </div>
                            <div className="col-sm-6 px-lg-5 px-4 mt-sm-0 mt-5">
                                <form onSubmit={handleForm}>
                                    <label htmlFor="full-name" className="pb-1">Full Name</label>
                                    <input id="full-name" name="cName" value={cForm.cName} onChange={handleChange} className={`form-control rounded-0 shadow-none py-2 ${error && !cForm.cName.trim() ? "error-input" : ""}`} type="text" />
                                    <p className="my-1">{error && cForm.cName.trim().length === 0 ? "Name is required" : ""}</p>
                                    <label htmlFor="email" className="pb-1">Email</label>
                                    <input id="email" name="cEmail" value={cForm.cEmail} onChange={handleChange} className={`form-control rounded-0 shadow-none py-2 ${error && !cForm.cEmail.trim() ? "error-input" : ""}`} type="email" />
                                    <p className="my-1">{error && cForm.cEmail.trim().length === 0 ? "Email is required" : ""}</p>
                                    <label htmlFor="phone" className="pb-1">Phone</label>
                                    <input id="phone" name="cPhone" value={cForm.cPhone} onChange={handleChange} className={`form-control rounded-0 shadow-none py-2 ${(showRequiredError || showLengthError) ? "error-input" : ""}`} type="number" />
                                    <p className="my-1">{showRequiredError ? "Phone number is required" : showLengthError ? "Phone number should be in 10 digit" : ""}</p>
                                    <label htmlFor="message" className="pb-1">Message</label>
                                    <textarea id="message" name="cMessage" value={cForm.cMessage} onChange={handleChange} className={`form-control rounded-0 shadow-none py-2 ${error && !cForm.cMessage.trim() ? "error-input" : ""}`} rows={3}></textarea>
                                    <p className="my-1">{error && cForm.cMessage.trim().length === 0 ? "Message is required" : ""}</p>
                                    <div className="d-flex justify-content-between mt-3">
                                        <button onClick={handleReset} type="button" className="btn text-uppercase form-control shadow-none fw-bold rounded-0 me-2 px-5">reset</button>
                                        <button type="submit" disabled={loading} className="btn text-uppercase form-control shadow-none fw-bold rounded-0 ms-2 px-5">{loading ? <><div className="spinner mx-auto"></div></> : "submit"}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="links-section">
                    <div className="container">
                        <div className="row py-sm-5 py-4">
                            {CONTACT_LINKS.map((link, index) => (
                                <div key={index} className="col-sm-4 py-sm-0 py-3">
                                    <div className="d-flex justify-content-center">
                                        <img src={link.icon} alt={link.alt} />
                                    </div>
                                    <p className="text-center mb-0 mt-sm-4 mt-3">{link.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="map-section" className="my-lg-5 my-4 py-lg-5 py-4">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                {contact?.map && (
                                    <iframe src={contact.map} width="100%" height="500" title="kgnelectrodes_map" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" ></iframe>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

export default Contact;
