import { toast } from "react-toastify";
import Sidebar from "../common/Sidebar";
import { useCallback, useEffect, useState } from "react";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Apply() {
    const [data, setData] = useState([]);
    const [apply, setApply] = useState({ title: "", name: "", email: "", phone: "", message: "", file: "" });
    const [modal, setModal] = useState({ action: false, delete: false, multi: false });
    const [id, setId] = useState("");
    const [selectedId, setSelectedId] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState({
        table: false,
        modal: false,
        form: false
    });

    const handleFetch = useCallback(async () => {
        setLoading(prev => ({ ...prev, table: true }));
        try {
            const res = await fetch(`${BASE_URL}/admin/fetchapply`,{
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
            console.log("Error during fetch apply data:", error);
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
            const res = await fetch(`${BASE_URL}/admin/fetchapplybyid/${id}`,{
                credentials: "include"
            });
            const resData = await res.json();
            if (!res.ok) {
                toast(resData.message, { type: "error" });
            } else {
                setApply((prev) => ({
                    ...prev,
                    title: resData.data.title,
                    name: resData.data.name,
                    email: resData.data.email,
                    phone: resData.data.phone,
                    message: resData.data.message,
                    file: resData.data.file
                }));
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during fetch apply data by id:", error);
        } finally {
            setLoading(prev => ({ ...prev, modal: false }));
        }
    }, []);

    const handleDelete = async () => {
        setLoading(prev => ({ ...prev, form: true }));
        try {
            const res = await fetch(`${BASE_URL}/admin/deleteapply/${id}`,{
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
            console.log("Error during single delete apply data:", error);
        } finally {
            setLoading(prev => ({ ...prev, form: false }));
        }
    }

    const handleMultiDelete = async () => {
        setLoading(prev => ({ ...prev, form: true }));
        try {
            const res = await fetch(`${BASE_URL}/admin/multideleteapply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(selectedId)
            });
            const resData = await res.json();
            if (res.ok) {
                handleFetch();
                setSelectedId([]);
                setModal(prev => ({ ...prev, multi: false }));
                toast(resData.message, { type: "success" });
            } else {
                toast(resData.message, { type: "error" });
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during multi delete apply data:", error);
        } finally {
            setLoading(prev => ({ ...prev, form: false }));
        }
    }

    const handleModal = (id) => {
        setId(id);
        setModal(prev => ({ ...prev, action: true }));
        fetchByID(id);
    }

    const closeModal = () => {
        setApply({
            title: "",
            name: "",
            email: "",
            phone: "",
            message: "",
        });
        setId("empty");
        setModal(prev => ({ ...prev, action: false }));
    }

    const handleSelect = (id) => {
        if (selectedId.includes(id)) {
            setSelectedId(selectedId.filter(item => item !== id));
        } else {
            setSelectedId([...selectedId, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedId([]);
        } else {
            const ids = data.map(dt => dt._id);
            setSelectedId(ids);
        }
        setSelectAll(!selectAll);
    };

    const handleDeleteModal = (modal, id) => {
        setId(modal ? id : "empty");
        setModal(prev => ({ ...prev, delete: modal }));
    }

    const handleDeleteSelected = () => {
        setModal(prev => ({ ...prev, multi: true }));
    };

    const handleDownload = async () => {
        console.log("call handleDownload");
        console.log("id ->",apply._id);
        setLoading(prev => ({ ...prev, form: true }));
        try {
            const res = await fetch(`${BASE_URL}/admin/downloadPDF/${apply._id}`, {
                credentials: "include",
            });
            const resData = await res.json();
            if (res.ok) {
                setModal(prev => ({ ...prev, action: false }));
                toast(resData.message, { type: "success" });
            } else {
                toast(resData.message, { type: "error" });
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during download file:", error);
        } finally {
            setLoading(prev => ({ ...prev, form: false }));
        }
    }

    return (
        <>
            <main id="admin-section">
                <div className="container-fluid">
                    <div className="row">
                        <Sidebar />
                        <div className="col-sm-9 col-12 admin-div">
                            <h2 className="fw-bold text-center text-uppercase mt-4 mb-0">apply management page</h2>
                            <div className="d-flex justify-content-end my-4"><button onClick={handleSelectAll} className="btn1 text-uppercase rounded-0 fw-bold px-4">{selectAll ? "disselect all" : "select all"}</button><button disabled={selectedId.length === 0} onClick={handleDeleteSelected} className="btn text-uppercase rounded-0 fw-bold px-4">delete selected</button></div>
                            <div className="table-responsive">
                                <table className="table text-center table-bordered align-middle">
                                    <thead className="align-middle text-uppercase">
                                        <tr>
                                            <th>s.no.</th>
                                            <th>title</th>
                                            <th>name</th>
                                            <th>email</th>
                                            <th>phone</th>
                                            <th>cover letter</th>
                                            <th>action</th>
                                            <th>select</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading.table ?
                                            <tr>
                                                <td colSpan={8} className="py-2"><div className="spinner mx-auto"></div></td>
                                            </tr>
                                            :
                                            data.length === 0 ?
                                                <tr>
                                                    <td colSpan={8} className="text-uppercase">no data</td>
                                                </tr>
                                                :
                                                data.map((dt, index) => (
                                                    <tr key={dt._id}>
                                                        <td>{index + 1}</td>
                                                        <td>{dt.title}</td>
                                                        <td>{dt.name}</td>
                                                        <td>{dt.email}</td>
                                                        <td>{dt.phone}</td>
                                                        <td>{dt.message}</td>
                                                        <td><button onClick={() => handleModal(dt._id)} className="btn fw-bold text-uppercase btn1 rounded-0 px-4">show</button><button onClick={() => handleDeleteModal(true, dt._id)} className="btn fw-bold text-uppercase btn2 rounded-0 px-4">delete</button></td>
                                                        <td><input type="checkbox" checked={selectedId.includes(dt._id)} onChange={() => handleSelect(dt._id)} aria-label={`Select ${dt._id}`} /></td>
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
                                <h3 className="text-center text-uppercase fw-bold mb-sm-4 mb-3">apply section</h3>
                                <div className="modal-body px-3">
                                    {loading.modal ? <><div className="modal-spinner mx-auto"></div></> :
                                        <>
                                            <label className="mb-1">Title</label>
                                            <input value={apply.title} disabled type="text" className="form-control shadow-none rounded-0" />
                                            <label className="mb-1 mt-3">Name</label>
                                            <input value={apply.name} disabled type="text" className="form-control shadow-none rounded-0" />
                                            <label className="mb-1 mt-3">Email</label>
                                            <input value={apply.email} disabled type="text" className="form-control shadow-none rounded-0" />
                                            <label className="mb-1 mt-3">Phone</label>
                                            <input value={apply.phone} disabled type="text" className="form-control shadow-none rounded-0" />
                                            <label className="mb-1 mt-3">Cover letter</label>
                                            <textarea value={apply.message} disabled rows={5} className="form-control shadow-none rounded-0" ></textarea>
                                            {apply.file === "none" ? <label className="mt-3">cv/resume not available</label> :
                                                <>
                                                    <label className="mb-1 mt-3">CV/Resume</label>
                                                    {apply.file.includes("/image/") ?
                                                        <img className="w-100" src={apply.file} alt="not-found" /> :
                                                        <a className="d-flex fw-bold text-decoration-none mt-2 p-2" onClick={handleDownload} target="_blank" rel="noopener noreferrer" >Download PDF</a>
                                                    }
                                                </>
                                            }

                                        </>
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
                                    <button onClick={handleDelete} disabled={loading.form} className="btn form-control text-uppercase rounded-0 shadow-none fw-bold mx-2">{loading.form ? <><div className="spinner mx-auto"></div></> : "delete"}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            }

            {modal.multi &&
                <section id="edit-modal-section" className="position-fixed top-0 bottom-0 start-0 end-0 z-1 d-flex align-items-center">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-6 col-12 edit-modal-div py-sm-5 py-4 px-sm-5 px-4">
                                <h3 className="text-center text-uppercase fw-bold mb-sm-4 mb-3">Are you sure you want to delete?</h3>
                                <div className="d-flex">
                                    <button onClick={() => setModal(prev => ({ ...prev, multi: false }))} className="btn form-control text-uppercase rounded-0 shadow-none fw-bold mx-2">cancel</button>
                                    <button onClick={handleMultiDelete} disabled={loading.form} className="btn form-control text-uppercase rounded-0 shadow-none fw-bold mx-2">{loading.form ? <><div className="spinner mx-auto"></div></> : "delete"}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            }
        </>
    );
}

export default Apply;
