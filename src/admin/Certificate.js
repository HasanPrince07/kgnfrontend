import { useCallback, useEffect, useState } from "react";
import Sidebar from "../common/Sidebar";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Certificate() {
    const [editModal, setEditModal] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState({
        table: false,
        form: false
    });

    const handleFetch = useCallback(async () => {
        setLoading(prev => ({ ...prev, table: true }));
        try {
            const res = await fetch(`${BASE_URL}/admin/fetchcertificate`,{
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
            console.log("Error during fetch certificate data:", error);
        } finally {
            setLoading(prev => ({ ...prev, table: false }));
        }
    }, []);

    useEffect(() => {
        handleFetch();
    }, [handleFetch]);

    const handleForm = async (e) => {
        e.preventDefault();
        const formdata = new FormData();
        selectedImages.forEach((image) => {
            if (image.file) {
                formdata.append("images", image.file);
            } else {
                formdata.append("existingImages", image);
            }
        });
        setLoading(prev => ({ ...prev, form: true }));
        try {
            const res = await fetch(`${BASE_URL}/admin/updatecertificate/${data?._id}`, {
                method: "PUT",
                credentials: "include",
                body: formdata
            });
            const resData = await res.json();
            if (!res.ok) {
                toast(resData.message, { type: "error" });
            } else {
                setData(resData.data);
                setEditModal(false);
                toast(resData.message, { type: "success" });
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during update certificate data:", error);
        } finally {
            setLoading(prev => ({ ...prev, form: false }));
        }
    }

    const handleModal = (modal) => {
        if (modal) {
            setSelectedImages(data.images);
            setEditModal(true);
        } else {
            setEditModal(false);
        }
    }

    function handleSelectedImage(e) {
        const files = Array.from(e.target.files);
        const imagesArray = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setSelectedImages(prev => [...prev, ...imagesArray]);
    }

    const handleRemove = (src) => {
        if (src.preview) {
            URL.revokeObjectURL(src.preview);
        }
        setSelectedImages((prev) =>
            prev.filter((dt) => (src.preview ? dt.preview !== src.preview : dt !== src))
        );
    }

    return (
        <>
            <main id="admin-section">
                <div className="container-fluid">
                    <div className="row">
                        <Sidebar />
                        <div className="col-sm-9 col-12 admin-div">
                            <h2 className="fw-bold text-center text-uppercase my-4">certificate management page</h2>
                            <div className="table-responsive">
                                <table className="table text-center table-bordered align-middle">
                                    <thead className="align-middle text-uppercase">
                                        <tr>
                                            <th>s.no.</th>
                                            <th>images</th>
                                            <th>action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading.table ?
                                            <tr>
                                                <td colSpan={3} className="py-2"><div className="spinner mx-auto"></div></td>
                                            </tr>
                                            :
                                            data ?
                                                <tr>
                                                    <td>1</td>
                                                    <td>
                                                        {data.images.length === 0 ? "Select an image" : data.images.map((dt, index) => (
                                                            <img key={index} className="p-1" src={dt} alt="not-found" />
                                                        ))}
                                                    </td>
                                                    <td><button onClick={() => handleModal(true)} className="btn fw-bold text-uppercase rounded-0 px-4">edit</button></td>
                                                </tr>
                                                :
                                                <tr>
                                                    <td colSpan={3} className="text-uppercase">no data</td>
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
                <>
                    <section id="edit-modal-section" className="position-fixed top-0 bottom-0 start-0 end-0 z-1 d-flex align-items-center">
                        <div className="container">
                            <div className="row justify-content-center">
                                <div className="col-lg-6 col-12 edit-modal-div position-relative py-sm-5 py-4 px-sm-5 px-4">
                                    <img role="button" onClick={() => handleModal(false)} className="position-absolute" src="media/close.png" alt="close icon" />
                                    <h3 className="text-center text-uppercase fw-bold mb-sm-4 mb-3">update certificate section</h3>
                                    <div className="modal-body px-3">
                                        <form onSubmit={handleForm}>
                                            <label className="mb-1">Certificates(ratio 1:1)</label>
                                            <input onChange={handleSelectedImage} type="file" multiple accept="image/*" className="form-control shadow-none rounded-0" />
                                            <div className="row mt-2 mb-3 align-items-center gy-2">
                                                {selectedImages?.map((img, index) => (
                                                    <div className="col-sm-4 col-6 position-relative" key={index}>
                                                        <img className="w-100" src={img.preview || img} alt="not-found" />
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
                </>
            }
        </>
    );
}

export default Certificate;
