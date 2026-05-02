import { useCallback, useEffect, useState } from "react";
import Sidebar from "../common/Sidebar";
import { toast } from "react-toastify";

function Wallpaper() {
    const [modal, setModal] = useState(false);
    const [data, setData] = useState([]);
    const [wallpaper, setWallpaper] = useState({
        title: "",
        image: "",
    });
    const [loading, setLoading] = useState({
        table: false,
        form: false,
        modal: false
    });
    const [id, setId] = useState("");
    const [error, setError] = useState(false);

    const handleFetch = useCallback(async () => {
        setLoading(prev => ({ ...prev, table: true }));
        try {
            const res = await fetch(`/admin/fetchwallpaper/0`,{
                credentials: "include"
            });
            const resData = await res.json();
            if (!res.ok) {
                if (res.status === 404) {
                    setData([]);
                    console.warn(resData.message);
                } else {
                    toast(resData.message, { type: "error" });
                }
            } else {
                setData(resData.data);
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during fetch wallpaper data:", error);
        } finally {
            setLoading(prev => ({ ...prev, table: false }));
        }
    }, []);

    useEffect(() => {
        handleFetch();
    }, [handleFetch]);

    const fetchByID = useCallback(async (id) => {
        setLoading(prev => ({ ...prev, modal: true }));
        try {
            const res = await fetch(`/admin/fetchwallpaperbyid/${id}`,{
                credentials: "include"
            });
            const resData = await res.json();
            if (!res.ok) {
                toast(resData.message, { type: "error" });
            } else {
                setWallpaper((prev) => ({
                    ...prev,
                    title: resData.data.title,
                    image: resData.data.image,
                }));
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during fetch wallpaper data by id:", error);
        } finally {
            setLoading(prev => ({ ...prev, modal: false }));
        }
    }, []);

    const handleForm = async (e) => {
        e.preventDefault();
        const { title, image } = wallpaper;
        if (!title.trim()) {
            setError(true);
            return
        }
        const formdata = new FormData();
        formdata.append("title", title);
        if (image.file) {
            formdata.append("image", image.file);
        } else {
            formdata.append("existingImage", image);
        }
        setLoading(prev => ({ ...prev, form: true }));
        try {
            const res = await fetch(`/admin/updatewallpaper/${id}`, {
                method: "PUT",
                credentials: "include",
                body: formdata
            });
            const resData = await res.json();
            if (!res.ok) {
                toast(resData.message, { type: "error" });
            } else {
                handleFetch();
                setError(false);
                setModal(false);
                toast(resData.message, { type: "success" });
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during update wallpaper data:", error);
        } finally {
            setLoading(prev => ({ ...prev, form: false }));
        }
    };

    const handleModal = (id) => {
        fetchByID(id);
        setModal(true);
        setId(id);
    }

    const handleSelectedImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const imageObj = {
            file,
            preview: URL.createObjectURL(file),
        };
        setWallpaper({ ...wallpaper, image: imageObj });
    }

    const handleRemove = (src) => {
        if (src.preview) URL.revokeObjectURL(src.preview);
        setWallpaper({ ...wallpaper, image: "" });
    };

    return (
        <>
            <main id="admin-section">
                <div className="container-fluid">
                    <div className="row">
                        <Sidebar />
                        <div className="col-sm-9 col-12 admin-div">
                            <h2 className="fw-bold text-center text-uppercase my-4">Wallpaper management page</h2>
                            <div className="table-responsive overflow-auto">
                                <table className="table text-center table-bordered align-middle">
                                    <thead className="align-middle text-uppercase">
                                        <tr>
                                            <th>s.no.</th>
                                            <th>title</th>
                                            <th>wallpaper</th>
                                            <th>action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading.table ?
                                            <tr>
                                                <td colSpan={4} className="py-2"><div className="spinner mx-auto"></div></td>
                                            </tr>
                                            :
                                            data.length === 0 ?
                                                <tr>
                                                    <td colSpan={4} className="text-uppercase">no data</td>
                                                </tr>
                                                :
                                                data.map((dt, index) => (
                                                    <tr key={dt._id}>
                                                        <td>{index + 1}</td>
                                                        <td>{dt.title}</td>
                                                        <td>{dt.image === "none" ? "Image not selected" : <img src={dt.image} alt="not-found" />}</td>
                                                        <td><button onClick={() => handleModal(dt._id)} className="btn fw-bold text-uppercase btn1 rounded-0 px-4">edit</button></td>
                                                    </tr>
                                                ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {modal &&
                <section id="edit-modal-section" className="position-fixed top-0 bottom-0 start-0 end-0 z-1 d-flex align-items-center">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-6 col-12 edit-modal-div position-relative py-sm-5 py-4 px-sm-5 px-4">
                                <img role="button" onClick={() => setModal(false)} className="position-absolute" src="media/close.png" alt="close icon" />
                                <h3 className="text-center text-uppercase fw-bold mb-sm-4 mb-3">update wallpaper section</h3>
                                <div className="modal-body px-3">
                                    <form onSubmit={handleForm}>
                                        <label className="mb-1">Title</label>
                                        <input value={wallpaper.title} onChange={(e) => setWallpaper((prev) => ({ ...prev, title: e.target.value }))} type="text" className={`form-control rounded-0 shadow-none ${error && !wallpaper.title.trim() ? "error-input" : ""}`} />
                                        <p className="my-1">{error && !wallpaper.title.trim() ? "Title is required" : ""}</p>
                                        <label className="mb-1">Wallpapers(ratio 2.05:1)</label>
                                        <input onChange={handleSelectedImage} type="file" accept="image/*" className="form-control shadow-none rounded-0" />
                                        {wallpaper.image ?
                                            <div className="row mt-2 mb-3 align-items-center gy-2">
                                                <div className="col-sm-4 col-6 position-relative">
                                                    <img
                                                        className="w-100"
                                                        src={wallpaper.image.preview ? wallpaper.image.preview : wallpaper.image}
                                                        alt="not-found"
                                                    />
                                                    <p
                                                        onClick={() => handleRemove(wallpaper.image)}
                                                        className="text-center close-button m-0"
                                                    >
                                                        close
                                                    </p>
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

export default Wallpaper;