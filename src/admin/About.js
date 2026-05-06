import { useCallback, useEffect, useState } from "react";
import Sidebar from "../common/Sidebar";
import { toast } from "react-toastify";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function AboutAdmin() {
    const [editModal, setEditModal] = useState(false);
    const [data, setData] = useState(null);
    const [about, setAbout] = useState({
        title: "",
        description: "",
        company: "",
        vision: "",
        features: [],
        chooseus: [],
        images: []
    });
    const [loading, setLoading] = useState({
        table: false,
        form: false
    });
    const [error, setError] = useState(false);

    const handleFetch = useCallback(async () => {
        setLoading(prev => ({ ...prev, table: true }));
        try {
            const res = await fetch(`${BASE_URL}/admin/fetchabout`, {
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
            console.log("Error during fetch about data:", error);
        } finally {
            setLoading(prev => ({ ...prev, table: false }));
        }
    }, []);

    useEffect(() => {
        handleFetch();
    }, [handleFetch]);

    const handleForm = async (e) => {
        e.preventDefault();
        const { title, description, company, vision, features, chooseus, images } = about;
        if (!title.trim() || !description.trim() || !company.trim() || !vision.trim() || !features || !chooseus) {
            setError(true);
            return
        }
        const formdata = new FormData();
        formdata.append("title", title);
        formdata.append("description", description);
        formdata.append("company", company);
        formdata.append("vision", vision);
        formdata.append("features", JSON.stringify(features));
        formdata.append("chooseus", JSON.stringify(chooseus));
        images.forEach((image) => {
            if (image.file) {
                formdata.append("images", image.file);
            } else {
                formdata.append("existingImages", image);
            }
        });
        setLoading(prev => ({ ...prev, form: true }));
        try {
            const res = await fetch(`${BASE_URL}/admin/updateabout/${data?._id}`, {
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
            console.log("Error during update about data:", error);
        } finally {
            setLoading(prev => ({ ...prev, form: false }));
        }
    }

    const handleModal = (modal) => {
        if (modal) {
            setAbout({
                title: data?.title,
                description: data?.description,
                company: data?.company,
                vision: data?.vision,
                features: data?.features,
                chooseus: data?.chooseus,
                images: data?.images
            });
            setEditModal(true);
        } else {
            setEditModal(false);
            setError(false);
        }
    }

    const handleSelectedImage = useCallback((e) => {
        const files = Array.from(e.target.files);
        const imagesArray = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setAbout(prev => ({ ...prev, images: [...prev.images, ...imagesArray] }));
    }, []);

    const handleRemove = useCallback((src) => {
        if (src.preview) {
            URL.revokeObjectURL(src.preview);
        }
        setAbout(prev =>
            ({ ...prev, images: prev.images.filter(dt => src.preview ? dt.preview !== src.preview : dt !== src), })
        );
    }, []);

    return (
        <>
            <main id="admin-section">
                <div className="container-fluid">
                    <div className="row">
                        <Sidebar />
                        <div className="col-sm-9 col-12 admin-div">
                            <h2 className="fw-bold text-center text-uppercase my-4">about management page</h2>
                            <div className="table-responsive">
                                <table className="table text-center table-bordered align-middle">
                                    <thead className="align-middle text-uppercase">
                                        <tr>
                                            <th>s.no.</th>
                                            <th>title</th>
                                            <th>description</th>
                                            <th>company</th>
                                            <th>vision</th>
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
                                                    <td>{data.title}</td>
                                                    <td>{data.description}</td>
                                                    <td>{data.company}</td>
                                                    <td>{data.vision}</td>
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
                            <div className="col-lg-6 col-12 edit-modal-div position-relative py-sm-5 py-4 px-sm-5 px-4">
                                <img role="button" onClick={() => handleModal(false)} className="position-absolute" src="media/close.png" alt="close icon" />
                                <h3 className="text-center text-uppercase fw-bold mb-sm-4 mb-3">update about section</h3>
                                <div className="modal-body px-3">
                                    <form onSubmit={handleForm}>
                                        <label className="mb-1">Title</label>
                                        <input value={about.title} onChange={(e) => setAbout((prev) => ({ ...prev, title: e.target.value }))} type="text" className={`form-control rounded-0 shadow-none ${error && !about.title.trim() ? "error-input" : ""}`} />
                                        <p className="my-1">{error && !about.title.trim() ? "Title is required" : ""}</p>
                                        <label className="mb-1">Description</label>
                                        <textarea value={about.description} onChange={(e) => setAbout((prev) => ({ ...prev, description: e.target.value }))} rows={3} className={`form-control rounded-0 shadow-none ${error && !about.description.trim() ? "error-input" : ""}`}></textarea>
                                        <p className="my-1">{error && !about.description.trim() ? "Description is required" : ""}</p>
                                        <label className="mb-1">Company</label>
                                        <textarea value={about.company} onChange={(e) => setAbout((prev) => ({ ...prev, company: e.target.value }))} rows={3} className={`form-control rounded-0 shadow-none ${error && !about.company.trim() ? "error-input" : ""}`}></textarea>
                                        <p className="my-1">{error && !about.company.trim() ? "Company is required" : ""}</p>
                                        <label className="mb-1">Vision</label>
                                        <textarea value={about.vision} onChange={(e) => setAbout((prev) => ({ ...prev, vision: e.target.value }))} rows={3} className={`form-control rounded-0 shadow-none ${error && !about.vision.trim() ? "error-input" : ""}`}></textarea>
                                        <p className="my-1">{error && !about.vision.trim() ? "Vision is required" : ""}</p>
                                        <div className="d-flex justify-content-between mb-1">
                                            <label>Features</label>
                                            <button type="button" onClick={() => setAbout((prev) => ({ ...prev, features: [...prev.features, ""] }))} className="fw-bold px-3">+</button>
                                        </div>
                                        {about.features.map((dt, index) => (
                                            <div key={index} className="d-flex mb-2">
                                                <input value={dt} onChange={(e) => { const newFeatures = [...about.features]; newFeatures[index] = e.target.value; setAbout((prev) => ({ ...prev, features: newFeatures })) }} type="text" className="form-control shadow-none rounded-0" />
                                                <button type="button" className="fw-bold px-3" onClick={() => { const newFeatures = about.features.filter((_, i) => i !== index); setAbout(prev => ({ ...prev, features: newFeatures })); }}>-</button>
                                            </div>
                                        ))}
                                        <p className="mb-1">{error && !about.features ? "Features is required" : ""}</p>
                                        <div className="d-flex justify-content-between mb-1">
                                            <label>Choose Us</label>
                                            <button type="button" onClick={() => setAbout((prev) => ({ ...prev, chooseus: [...prev.chooseus, ""] }))} className="fw-bold px-3">+</button>
                                        </div>
                                        {about.chooseus.map((dt, index) => (
                                            <div key={index} className="d-flex mb-2">
                                                <input value={dt} onChange={(e) => { const newChooseus = [...about.chooseus]; newChooseus[index] = e.target.value; setAbout((prev) => ({ ...prev, chooseus: newChooseus })) }} type="text" className="form-control shadow-none rounded-0" />
                                                <button type="button" className="fw-bold px-3" onClick={() => { const newChooseus = about.chooseus.filter((_, i) => i !== index); setAbout(prev => ({ ...prev, chooseus: newChooseus })); }}>-</button>
                                            </div>
                                        ))}
                                        <p className="mb-1">{error && !about.chooseus ? "Choose Us is required" : ""}</p>
                                        <label className="mb-1">Images(select 5 images & first one is a owner image)</label>
                                        <input onChange={handleSelectedImage} type="file" multiple accept="image/*" className="form-control shadow-none rounded-0" />
                                        <div className="row mt-2 mb-3 align-items-center gy-2">
                                            {about.images?.map((img, index) => (
                                                <div className="col-sm-4 col-6 position-relative" key={index}>
                                                    <img className="w-100" src={img.preview ? img.preview : `${BASE_URL}/${img}`} alt="not-found" />
                                                    <p onClick={() => handleRemove(img)} className="text-center close-button m-0">close</p>
                                                </div>
                                            ))}
                                        </div>
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

export default AboutAdmin;
