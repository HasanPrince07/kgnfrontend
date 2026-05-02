import { useCallback, useEffect, useState } from "react";
import Sidebar from "../common/Sidebar";
import { toast } from "react-toastify";

function ProductAdmin() {
    const [data, setData] = useState([]);
    const [product, setProduct] = useState({
        image: "",
        name: "",
        description: "",
        applications: "",
        positions: "",
        usage: [],
        chemical: [],
        mechanical: []
    });
    const [id, setId] = useState("");
    const [loading, setLoading] = useState({
        table: false,
        form: false,
        modal: false
    });
    const [modal, setModal] = useState({ action: false, delete: false });
    const [error, setError] = useState(false);

    const handleFetch = useCallback(async () => {
        setLoading(prev => ({ ...prev, table: true }));
        try {
            const res = await fetch(`/admin/fetchproduct`,{
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
            console.log("Error during fetch product data:", error);
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
            const res = await fetch(`/admin/fetchproductbyid/${id}`,{
                credentials: "include"
            });
            const resData = await res.json();
            if (!res.ok) {
                toast(resData.message, { type: "error" });
            } else {
                setProduct((prev) => ({
                    ...prev,
                    name: resData.data.name,
                    positions: resData.data.positions,
                    description: resData.data.description,
                    applications: resData.data.applications,
                    usage: resData.data.usage,
                    chemical: resData.data.chemical,
                    mechanical: resData.data.mechanical,
                    image: resData.data.image
                }));
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during fetch product data by id:", error);
        } finally {
            setLoading(prev => ({ ...prev, modal: false }));
        }
    }, []);

    const handleForm = async (e) => {
        e.preventDefault();
        const { name, description, applications, positions, usage, chemical, mechanical, image } = product;
        if (name.trim().length === 0 || description.trim().length === 0 || applications.trim().length === 0 || positions.trim().length === 0) {
            setError(true);
            return
        }
        const formdata = new FormData();
        formdata.append("name", name);
        formdata.append("description", description);
        formdata.append("applications", applications);
        formdata.append("positions", positions);
        formdata.append("usage", JSON.stringify(usage));
        formdata.append("chemical", JSON.stringify(chemical));
        formdata.append("mechanical", JSON.stringify(mechanical));
        if (image.file) {
            formdata.append("image", image.file);
        } else {
            formdata.append("image", image);
        }
        setLoading(prev => ({ ...prev, form: true }));
        try {
            const res = await fetch(`/admin/addproduct`, {
                method: "POST",
                credentials: "include",
                body: formdata
            });
            const resData = await res.json();
            if (res.ok) {
                handleFetch();
                setError(false);
                setModal(false);
                toast(resData.message, { type: "success" });
            } else {
                toast(resData.message, { type: "error" });
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during add product data:", error);
        } finally {
            setLoading(prev => ({ ...prev, form: false }));
        }
    }

    const handleDelete = async () => {
        try {
            const res = await fetch(`/admin/deleteproduct/${id}`,{
                credentials: "include"
            });
            const resData = await res.json();
            if (!res.ok) {
                toast(resData.message, { type: "error" });
            } else {
                handleFetch();
                setId("empty");
                setModal(prev => ({ ...prev, delete: false }));
                toast(resData.message, { type: "success" });
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during delete product data:", error);
        }
    }

    const handleSelectedImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const imageObj = {
            file,
            preview: URL.createObjectURL(file),
        };
        setProduct({ ...product, image: imageObj });
    }

    const handleRemove = (src) => {
        if (src.preview) URL.revokeObjectURL(src.preview);
        setProduct({ ...product, image: "" });
    };

    const handleModal = (modal, id) => {
        const isAdd = modal === "add"
        setId(isAdd ? "empty" : id);
        setModal(prev => ({ ...prev, action: true }));
        if (isAdd) {
            setProduct({
                image: "",
                name: "",
                description: "",
                applications: "",
                positions: "",
                usage: [],
                chemical: [],
                mechanical: [],
            });
        } else {
            fetchByID(id);
        }
    }

    const closeModal = () => {
        setProduct({
            image: "",
            name: "",
            description: "",
            applications: "",
            positions: "",
            usage: [],
            chemical: [],
            mechanical: [],
        });
        setId("empty");
        setError(false);
        setModal(prev => ({ ...prev, action: false }));
    }

    const handleDeleteModal = (modal, id) => {
        setId(modal ? id : "empty");
        setModal(prev => ({ ...prev, delete: modal }));
    }

    return (
        <>
            <main id="admin-section">
                <div className="container-fluid">
                    <div className="row">
                        <Sidebar />
                        <div className="col-sm-9 col-12 admin-div">
                            <h2 className="fw-bold text-center text-uppercase my-4">product management page</h2>
                            <div className="d-flex justify-content-end my-4"><button onClick={() => handleModal("add")} className="btn text-uppercase rounded-0 fw-bold px-4">add product</button></div>
                            <div className="table-responsive">
                                <table className="table text-center table-bordered align-middle">
                                    <thead className="align-middle text-uppercase">
                                        <tr>
                                            <th>s.no.</th>
                                            <th>name</th>
                                            <th>description</th>
                                            <th>image</th>
                                            <th>action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading.table ?
                                            <tr>
                                                <td colSpan={5} className="py-2"><div className="spinner mx-auto"></div></td>
                                            </tr>
                                            :
                                            data.length === 0 ?
                                                <tr>
                                                    <td colSpan={5} className="text-uppercase">no data</td>
                                                </tr>
                                                :
                                                data.map((dt, index) => (
                                                    <tr key={dt._id}>
                                                        <td>{index + 1}</td>
                                                        <td>{dt.name}</td>
                                                        <td>{dt.description}</td>
                                                        <td>{dt.image === "none" ? "Image not selected" : <img src={dt.image} alt="not-found" />}</td>
                                                        <td><button onClick={() => handleModal("show", dt._id)} className="btn fw-bold text-uppercase btn1 rounded-0 px-4">show</button><button onClick={() => handleDeleteModal(true, dt._id)} className="btn fw-bold text-uppercase btn2 rounded-0 px-4">delete</button></td>
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

            {modal.action &&
                <section id="edit-modal-section" className="position-fixed top-0 bottom-0 start-0 end-0 z-1 d-flex align-items-center">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-6 col-12 edit-modal-div position-relative py-sm-5 py-4 px-sm-5 px-4">
                                <img role="button" onClick={closeModal} className="position-absolute" src="media/close.png" alt="close icon" />
                                <h3 className="text-center text-uppercase fw-bold mb-sm-4 mb-3">{id === "empty" ? "add" : "selected"} product section</h3>
                                <div className="modal-body px-3">
                                    {loading.modal ? <><div className="modal-spinner mx-auto"></div></> :
                                        <form onSubmit={(e) => handleForm(e)}>
                                            <label className="mb-1">Name</label>
                                            <input value={product.name} disabled={id !== "empty"} onChange={(e) => setProduct((prev) => ({ ...prev, name: e.target.value }))} type="text" className={`form-control rounded-0 shadow-none ${error && !product.name.trim() ? "error-input" : ""}`} />
                                            <p className="my-1">{error && product.name.trim().length === 0 ? "Name is required" : ""}</p>
                                            <label className="mb-1">Positions</label>
                                            <input value={product.positions} disabled={id !== "empty"} onChange={(e) => setProduct((prev) => ({ ...prev, positions: e.target.value }))} type="text" className={`form-control rounded-0 shadow-none ${error && !product.positions.trim() ? "error-input" : ""}`} />
                                            <p className="my-1">{error && product.positions.trim().length === 0 ? "Positions is required" : ""}</p>
                                            <label className="mb-1">Description</label>
                                            <textarea value={product.description} disabled={id !== "empty"} onChange={(e) => setProduct((prev) => ({ ...prev, description: e.target.value }))} rows={3} className={`form-control rounded-0 shadow-none ${error && !product.description.trim() ? "error-input" : ""}`}></textarea>
                                            <p className="my-1">{error && product.description.trim().length === 0 ? "Description is required" : ""}</p>
                                            <label className="mb-1">Applications</label>
                                            <textarea value={product.applications} disabled={id !== "empty"} onChange={(e) => setProduct((prev) => ({ ...prev, applications: e.target.value }))} rows={3} className={`form-control rounded-0 shadow-none ${error && !product.applications.trim() ? "error-input" : ""}`}></textarea>
                                            <p className="my-1">{error && product.applications.trim().length === 0 ? "Applications is required" : ""}</p>
                                            <div className="d-flex justify-content-between mb-1">
                                                {product.usage.length === 0 && id !== "empty" ? "" :
                                                    <label>Usage</label>
                                                }
                                                {id === "empty" ?
                                                    <button type="button" onClick={() => setProduct((prev) => ({ ...prev, usage: [...prev.usage, ""] }))} className="fw-bold px-3">+</button>
                                                    : ""}
                                            </div>
                                            {product.usage.map((dt, index) => (
                                                <div key={index} className="d-flex mb-3">
                                                    <input disabled={id !== "empty"} value={dt} onChange={(e) => { const newUsage = [...product.usage]; newUsage[index] = e.target.value; setProduct((prev) => ({ ...prev, usage: newUsage })) }} type="text" className="form-control shadow-none rounded-0" />
                                                    {id === "empty" ?
                                                        <button type="button" className="fw-bold px-3" onClick={() => { const newUsage = product.usage.filter((_, i) => i !== index); setProduct(prev => ({ ...prev, usage: newUsage })); }}>-</button>
                                                        : ""}
                                                </div>
                                            ))}
                                            <div className="d-flex justify-content-between mb-1">
                                                {product.chemical.length === 0 && id !== "empty" ? "" :
                                                    <label>Chemical composition</label>
                                                }
                                                {id === "empty" ?
                                                    <button type="button" onClick={() => setProduct((prev) => ({ ...prev, chemical: [...prev.chemical, ""] }))} className="fw-bold px-3">+</button>
                                                    : ""}
                                            </div>
                                            {product.chemical.map((dt, index) => (
                                                <div key={index} className="d-flex mb-3">
                                                    <input disabled={id !== "empty"} value={dt} onChange={(e) => { const newChemical = [...product.chemical]; newChemical[index] = e.target.value; setProduct((prev) => ({ ...prev, chemical: newChemical })) }} type="text" className="form-control shadow-none rounded-0" />
                                                    {id === "empty" ?
                                                        <button type="button" className="fw-bold px-3" onClick={() => { const newChemical = product.chemical.filter((_, i) => i !== index); setProduct(prev => ({ ...prev, chemical: newChemical })); }}>-</button>
                                                        : ""}
                                                </div>
                                            ))}
                                            <div className="d-flex justify-content-between mb-1">
                                                {product.mechanical.length === 0 && id !== "empty" ? "" :
                                                    <label>Mechanical Properties</label>
                                                }
                                                {id === "empty" ?
                                                    <button type="button" onClick={() => setProduct((prev) => ({ ...prev, mechanical: [...prev.mechanical, ""] }))} className="fw-bold px-3">+</button>
                                                    : ""}
                                            </div>
                                            {product.mechanical.map((dt, index) => (
                                                <div key={index} className="d-flex mb-3">
                                                    <input disabled={id !== "empty"} value={dt} onChange={(e) => { const newMechanical = [...product.mechanical]; newMechanical[index] = e.target.value; setProduct((prev) => ({ ...prev, mechanical: newMechanical })) }} type="text" className="form-control shadow-none rounded-0" />
                                                    {id === "empty" ?
                                                        <button type="button" className="fw-bold px-3" onClick={() => { const newMechanical = product.mechanical.filter((_, i) => i !== index); setProduct(prev => ({ ...prev, mechanical: newMechanical })); }}>-</button>
                                                        : ""}
                                                </div>
                                            ))}
                                            <label className="mb-1">{id !== "empty" ? product.image === "none" ? "" : "Selected images" : "Image"}</label>
                                            {id !== "empty" ? "" :
                                                <input onChange={handleSelectedImage} type="file" accept="image/*" className="form-control shadow-none rounded-0" />
                                            }
                                            {product.image ?
                                                product.image === "none" ? <label>Image not selected</label> :
                                                    <div className="row mt-2 mb-3 align-items-center gy-2">
                                                        <div className="col-sm-4 col-6 position-relative">
                                                            <img
                                                                className="w-100"
                                                                src={product.image.preview ? product.image.preview : product.image}
                                                                alt="not-found"
                                                            />
                                                            {id !== "empty" ? "" :
                                                                <p
                                                                    onClick={() => handleRemove(product.image)}
                                                                    className="text-center close-button m-0"
                                                                >
                                                                    close
                                                                </p>
                                                            }
                                                        </div>
                                                    </div>
                                                : ""}
                                            {id === "empty" ?
                                                <div className="d-flex mt-sm-4 mt-2">
                                                    <button type="submit" disabled={loading.form} className="btn text-uppercase fw-bold shadow-none form-control rounded-0">{loading.form ? <><div className="spinner mx-auto"></div></> : "add"}</button>
                                                </div>
                                                : ""}
                                        </form>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            }

            {modal.delete &&
                <section id="edit-modal-section" className="position-fixed top-0 bottom-0 start-0 end-0 z-1 d-flex align-items-center">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-6 col-12 edit-modal-div py-sm-5 py-4 px-sm-5 px-4">
                                <h3 className="text-center text-uppercase fw-bold mb-sm-4 mb-3">Are you sure you want to delete?</h3>
                                <div className="d-flex">
                                    <button onClick={() => handleDeleteModal(false)} className="btn form-control text-uppercase rounded-0 shadow-none fw-bold mx-2">cancel</button>
                                    <button onClick={handleDelete} className="btn form-control text-uppercase rounded-0 shadow-none fw-bold mx-2">delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            }
        </>
    );
}

export default ProductAdmin;