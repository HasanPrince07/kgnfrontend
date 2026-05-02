import { useCallback, useEffect, useState } from "react";
import Sidebar from "../common/Sidebar";
import { toast } from "react-toastify";

function Contact() {
    const [editModal, setEditModal] = useState(false);
    const [data, setData] = useState(null);
    const [contact, setContact] = useState({
        image: "",
        phone: "",
        email: "",
        address: "",
        map: "",
        whatsapp: "",
        linkedin: "",
        facebook: "",
        footer: ""
    });
    const [loading, setLoading] = useState({
        table: false,
        form: false
    });
    const [error, setError] = useState(false);

    const handleFetch = useCallback(async () => {
        setLoading(prev => ({ ...prev, table: true }));
        try {
            const res = await fetch(`/admin/fetchcontact`,{
                credentials: "include"
            });
            const resData = await res.json();
            if (!res.ok) {
                if (res.status === 404) {
                    setData(null);
                    console.warn(resData.message);
                } else {
                    toast(resData.message, { type: "error" });
                }
            } else {
                setData(resData.data);
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during fetch contact data:", error);
        } finally {
            setLoading(prev => ({ ...prev, table: false }));
        }
    }, []);

    useEffect(() => {
        handleFetch();
    }, [handleFetch]);

    const handleForm = async (e) => {
        e.preventDefault();
        const { phone, email, map, whatsapp, linkedin, facebook, address, footer, image } = contact;
        if (phone.trim().length !== 10 || !email.trim() || !map.trim() || whatsapp.trim().length !== 10 || !linkedin.trim() || !facebook.trim() || !address.trim() || !footer) {
            setError(true);
            return;
        }
        const formdata = new FormData();
        formdata.append("phone", phone);
        formdata.append("email", email);
        formdata.append("map", map);
        formdata.append("whatsapp", whatsapp);
        formdata.append("linkedin", linkedin);
        formdata.append("facebook", facebook);
        formdata.append("address", address);
        formdata.append("footer", footer);
        if (image.file) {
            formdata.append("image", image.file);
        } else {
            formdata.append("existingImage", image);
        }
        setLoading(prev => ({ ...prev, form: true }));
        try {
            const res = await fetch(`/admin/updatecontact/${data?._id}`, {
                method: "PUT",
                credentials: "include",
                body: formdata
            });
            const resData = await res.json();
            if (!res.ok) {
                toast(resData.message, { type: "error" });
            } else {
                setData(resData.data);
                setError(false);
                setEditModal(false);
                toast(resData.message, { type: "success" });
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during update contact data:", error);
        } finally {
            setLoading(prev => ({ ...prev, form: false }));
        }
    }

    const handleModal = (modal) => {
        if (modal) {
            setContact({
                image: data?.image,
                phone: data?.phone,
                email: data?.email,
                address: data?.address,
                map: data?.map,
                whatsapp: data?.whatsapp,
                linkedin: data?.linkedin,
                facebook: data?.facebook,
                footer: data?.footer
            });
            setEditModal(true);
        } else {
            setError(false);
            setEditModal(false);
        }
    }

    const handleContact = (field, value) => {
        const phoneNumber = value.replace(/\D/g, "");
        if (phoneNumber.length < 11) {
            setContact(prev => ({ ...prev, [field]: phoneNumber }));
        }
    };

    const handleSelectedImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const imageObj = {
            file,
            preview: URL.createObjectURL(file),
        };
        setContact({ ...contact, image: imageObj });
    }

    const handleRemove = (src) => {
        if (src.preview) URL.revokeObjectURL(src.preview);
        setContact({ ...contact, image: "" });
    };

    const isPhoneValid = contact.phone.length === 10;
    const showLengthError = contact.phone.length > 0 && !isPhoneValid;
    const showRequiredError = error && !contact.phone;

    return (
        <>
            <main id="admin-section">
                <div className="container-fluid">
                    <div className="row">
                        <Sidebar />
                        <div className="col-sm-9 col-12 admin-div">
                            <h2 className="fw-bold text-center text-uppercase my-4">contact management page</h2>
                            <div className="table-responsive">
                                <table className="table text-center table-bordered align-middle">
                                    <thead className="align-middle text-uppercase">
                                        <tr>
                                            <th>s.no.</th>
                                            <th>phone</th>
                                            <th>email</th>
                                            <th>address</th>
                                            <th>footer</th>
                                            <th>action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading.table ?
                                            <tr>
                                                <td colSpan={6} className="py-2"><div className="spinner mx-auto"></div></td>
                                            </tr>
                                            :
                                            data ?
                                                <tr key={data._id}>
                                                    <td>1</td>
                                                    <td>{data.phone}</td>
                                                    <td>{data.email}</td>
                                                    <td>{data.address}</td>
                                                    <td>{data.footer}</td>
                                                    <td><button onClick={() => handleModal(true)} className="btn fw-bold text-uppercase rounded-0 px-4">edit</button></td>
                                                </tr>
                                                :
                                                <tr>
                                                    <td colSpan={6} className="text-uppercase">no data</td>
                                                </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {editModal &&
                <section id="edit-modal-section" className="position-fixed top-0 bottom-0 start-0 end-0 z-1 d-flex align-items-center">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-10 col-12 edit-modal-div position-relative py-sm-5 py-4 px-sm-5 px-4">
                                <img role="button" onClick={() => handleModal(false)} className="position-absolute" src="media/close.png" alt="close icon" />
                                <h3 className="text-center text-uppercase fw-bold mb-sm-4 mb-3">update contact section</h3>
                                <div className="modal-body px-3">
                                    <form onSubmit={handleForm}>
                                        <div className="row">
                                            <div className="col-sm-6 col-12">
                                                <label className="mb-1">Phone</label>
                                                <input value={contact.phone} onChange={(e) => handleContact("phone", e.target.value)} type="text" inputMode="numeric" className={`form-control rounded-0 shadow-none ${(showRequiredError || showLengthError) ? "error-input" : ""}`} />
                                                <p className="my-1">{showRequiredError ? "Phone number is required" : showLengthError ? "Phone number should be in 10 digit" : ""}</p>
                                            </div>
                                            <div className="col-sm-6 col-12">
                                                <label className="mb-1">Email</label>
                                                <input value={contact.email} onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))} type="email" className={`form-control rounded-0 shadow-none ${error && !contact.email.trim() ? "error-input" : ""}`} />
                                                <p className="my-1">{error && !contact.email.trim() ? "Email is required" : ""}</p>
                                            </div>
                                        </div>
                                        <label className="mb-1">Map Link</label>
                                        <textarea value={contact.map} onChange={(e) => setContact((prev) => ({ ...prev, map: e.target.value }))} rows={3} className={`form-control rounded-0 shadow-none ${error && !contact.map.trim() ? "error-input" : ""}`}></textarea>
                                        <p className="my-1">{error && !contact.map.trim() ? "Map link is required" : ""}</p>
                                        <div className="row">
                                            <div className="col-sm-4 col-12">
                                                <label className="mb-1">Whatsapp Number</label>
                                                <input value={contact.whatsapp} onChange={(e) => handleContact("whatsapp", e.target.value)} type="number" className={(error && contact.whatsapp.trim().length !== 10) || (contact.whatsapp.trim().length !== 0 && contact.whatsapp.trim().length !== 10) ? "form-control rounded-0 shadow-none error-input" : "form-control rounded-0 shadow-none"} />
                                                <p className="my-1">{error && !contact.whatsapp.trim() ? "Whatsapp number is required" : (contact.whatsapp.trim().length !== 0 && contact.whatsapp.trim().length !== 10) ? "Whatsapp number should be in 10 digit" : ""}</p>
                                            </div>
                                            <div className="col-sm-4 col-12">
                                                <label className="mb-1">Linkedin Link</label>
                                                <input value={contact.linkedin} onChange={(e) => setContact((prev) => ({ ...prev, linkedin: e.target.value }))} type="text" className={`form-control rounded-0 shadow-none ${error && !contact.linkedin.trim() ? "error-input" : ""}`} />
                                                <p className="my-1">{error && !contact.linkedin.trim() ? "Linkedin link is required" : ""}</p>
                                            </div>
                                            <div className="col-sm-4 col-12">
                                                <label className="mb-1">Facebook Link</label>
                                                <input value={contact.facebook} onChange={(e) => setContact((prev) => ({ ...prev, facebook: e.target.value }))} type="text" className={`form-control rounded-0 shadow-none ${error && !contact.facebook.trim() ? "error-input" : ""}`} />
                                                <p className="my-1">{error && !contact.facebook.trim() ? "Facebook link is required" : ""}</p>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-6 col-12">
                                                <label className="mb-1">Address</label>
                                                <input value={contact.address} onChange={(e) => setContact((prev) => ({ ...prev, address: e.target.value }))} type="text" className={`form-control rounded-0 shadow-none ${error && !contact.address.trim() ? "error-input" : ""}`} />
                                                <p className="my-1">{error && !contact.address.trim() ? "Address is required" : ""}</p>
                                            </div>
                                            <div className="col-sm-6 col-12">
                                                <label className="mb-1">Footer</label>
                                                <input value={contact.footer} onChange={(e) => setContact((prev) => ({ ...prev, footer: e.target.value }))} type="text" className={`form-control rounded-0 shadow-none ${error && !contact.footer.trim() ? "error-input" : ""}`} />
                                                <p className="my-1">{error && !contact.footer.trim() ? "Footer is required" : ""}</p>
                                            </div>
                                        </div>
                                        <label className="mb-1">Image</label>
                                        <input onChange={handleSelectedImage} type="file" accept="image/*" className="form-control shadow-none rounded-0" />
                                        {contact.image ?
                                            <div className="row mt-2 mb-3 align-items-center gy-2">
                                                <div className="col-sm-4 col-6 position-relative">
                                                    <img
                                                        className="w-100"
                                                        src={contact.image.preview ? contact.image.preview : contact.image}
                                                        alt="not-found"
                                                    />
                                                    <p onClick={() => handleRemove(contact.image)} className="text-center close-button m-0">close</p>
                                                </div>
                                            </div>
                                            : ""}
                                        <div className="d-flex mt-sm-4 mt-2">
                                            <button type="submit" disabled={loading.form} className="btn text-uppercase fw-bold shadow-none form-control rounded-0">{loading.form ? <><div className="spinner mx-auto"></div></> : "update"}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            }
        </>
    );
}

export default Contact;