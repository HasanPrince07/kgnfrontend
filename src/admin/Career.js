import { toast } from "react-toastify";
import Sidebar from "../common/Sidebar";
import { useCallback, useEffect, useState } from "react";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Career() {

    const [data, setData] = useState([]);
    const [career, setCareer] = useState({ title: "", brief: "", requirment: "", salary: "", location: "" });
    const [modal, setModal] = useState({ action: false, delete: false });
    const [id, setId] = useState("");
    const [loading, setLoading] = useState({
        table: false,
        modal: false,
        form: false,
    });
    const [error, setError] = useState(false);

    const handleFetch = useCallback(async () => {
        setLoading(prev => ({ ...prev, table: true }));
        try {
            const res = await fetch(`${BASE_URL}/admin/fetchcareer`,{
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
            console.log("Error during fetch career data:", error);
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
            const res = await fetch(`${BASE_URL}/admin/fetchcareerbyid/${id}`,{
                credentials: "include"
            });
            const resData = await res.json();
            if (!res.ok) {
                toast(resData.message, { type: "error" });
            } else {
                setCareer((prev) => ({
                    ...prev,
                    title: resData.data.title,
                    brief: resData.data.brief,
                    requirment: resData.data.requirment,
                    salary: resData.data.salary,
                    location: resData.data.location
                }));
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during fetch career data by id:", error);
        } finally {
            setLoading(prev => ({ ...prev, modal: false }));
        }
    }, []);

    const handleForm = async (e) => {
        e.preventDefault();
        const title = career.title
        const brief = career.brief
        const requirment = career.requirment
        const salary = career.salary
        const location = career.location
        const formdata = { title, brief, requirment, salary, location }
        if (!career.title.trim() || !career.brief.trim() || !career.requirment.trim() || !career.salary.trim() || !career.location.trim()) {
            setError(true);
            return
        }
        setLoading(prev => ({ ...prev, form: true }));
        try {
            const res = await fetch(`${BASE_URL}/admin/actioncareer/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formdata)
            });
            const resData = await res.json();
            if (res.ok) {
                handleFetch();
                setError(false);
                setModal(false);
                if (res.status === 201) {
                    toast(resData.message, { type: "success" });
                } else {
                    toast(resData.message, { type: "success" });
                }
            } else {
                toast(resData.message, { type: "error" });
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during action in career data:", error);
        } finally {
            setLoading(prev => ({ ...prev, form: false }));
        }
    }

    const handleDelete = async () => {
        setLoading(prev => ({ ...prev, form: true }));
        try {
            const res = await fetch(`${BASE_URL}/admin/deletecareer/${id}`,{
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
            console.log("Error during delete career data:", error);
        } finally {
            setLoading(prev => ({ ...prev, form: false }));
        }
    }

    const handleModal = (modal, id) => {
        const isAdd = modal === "add"
        setCareer({
            title: "",
            brief: "",
            requirment: "",
            salary: "",
            location: ""
        });
        setId(isAdd ? "empty" : id);
        setModal(prev => ({ ...prev, action: true }));
        if (!isAdd) {
            fetchByID(id);
        }
    }

    const closeModal = () => {
        setCareer({
            title: "",
            brief: "",
            requirment: "",
            salary: "",
            location: ""
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
                            <h2 className="fw-bold text-center text-uppercase mt-4 mb-0">career management page</h2>
                            <div className="d-flex justify-content-end my-4"><button onClick={() => handleModal("add")} className="btn text-uppercase rounded-0 fw-bold px-4">add career</button></div>
                            <div className="table-responsive">
                                <table className="table text-center table-bordered align-middle">
                                    <thead className="align-middle text-uppercase">
                                        <tr>
                                            <th>s.no.</th>
                                            <th>title</th>
                                            <th>brief</th>
                                            <th>requirments</th>
                                            <th>salary</th>
                                            <th>location</th>
                                            <th>action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading.table ?
                                            <tr>
                                                <td colSpan={7} className="py-2"><div className="spinner mx-auto"></div></td>
                                            </tr>
                                            :
                                            data.length === 0 ?
                                                <tr>
                                                    <td colSpan={7} className="text-uppercase">no data</td>
                                                </tr>
                                                :
                                                data.map((dt, index) => (
                                                    <tr key={dt._id}>
                                                        <td>{index + 1}</td>
                                                        <td>{dt.title}</td>
                                                        <td>{dt.brief}</td>
                                                        <td>{dt.requirment}</td>
                                                        <td>{dt.salary}</td>
                                                        <td>{dt.location}</td>
                                                        <td><button onClick={() => handleModal("edit", dt._id)} className="btn fw-bold text-uppercase btn1 rounded-0 px-4">edit</button><button onClick={() => handleDeleteModal(true, dt._id)} className="btn fw-bold text-uppercase btn2 rounded-0 px-4">delete</button></td>
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
                                <h3 className="text-center text-uppercase fw-bold mb-sm-4 mb-3">{id === "empty" ? "add" : "update"} career section</h3>
                                <div className="modal-body px-3">
                                    {loading.modal ? <><div className="modal-spinner mx-auto"></div></> :
                                        <form onSubmit={handleForm}>
                                            <label className="mb-1">Title</label>
                                            <input value={career.title} onChange={(e) => setCareer((prev) => ({ ...prev, title: e.target.value }))} type="text" className={`form-control rounded-0 shadow-none ${error && !career.title.trim() ? "error-input" : ""}`} />
                                            <p className="my-1">{error && !career.title.trim() ? "Title is required" : ""}</p>
                                            <label className="mb-1">Brief</label>
                                            <textarea value={career.brief} onChange={(e) => setCareer((prev) => ({ ...prev, brief: e.target.value }))} rows={3} className={`form-control rounded-0 shadow-none ${error && !career.brief.trim() ? "error-input" : ""}`}></textarea>
                                            <p className="my-1">{error && !career.brief.trim() ? "Brief is required" : ""}</p>
                                            <label className="mb-1">Requirment</label>
                                            <textarea value={career.requirment} onChange={(e) => setCareer((prev) => ({ ...prev, requirment: e.target.value }))} rows={3} className={`form-control rounded-0 shadow-none ${error && !career.requirment.trim() ? "error-input" : ""}`}></textarea>
                                            <p className="my-1">{error && !career.requirment.trim() ? "Requirment is required" : ""}</p>
                                            <label className="mb-1">Salary</label>
                                            <input value={career.salary} onChange={(e) => setCareer((prev) => ({ ...prev, salary: e.target.value }))} type="text" className={`form-control rounded-0 shadow-none ${error && !career.salary.trim() ? "error-input" : ""}`} />
                                            <p className="my-1">{error && !career.salary.trim() ? "Salary is required" : ""}</p>
                                            <label className="mb-1">Location</label>
                                            <input value={career.location} onChange={(e) => setCareer((prev) => ({ ...prev, location: e.target.value }))} type="text" className={`form-control rounded-0 shadow-none ${error && !career.location.trim() ? "error-input" : ""}`} />
                                            <p className="my-1">{error && !career.location.trim() ? "Location is required" : ""}</p>
                                            <div className="d-flex mt-sm-4 mt-2">
                                                <button type="submit" disabled={loading.form} className="btn text-uppercase fw-bold shadow-none form-control rounded-0">{loading.form ? <><div className="spinner mx-auto"></div></> : id === "empty" ? "add" : "update"}</button>
                                            </div>
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
                                    <button onClick={handleDelete} disabled={loading.form} className="btn form-control text-uppercase rounded-0 shadow-none fw-bold mx-2">{loading.form ? <><div className="spinner mx-auto"></div></> : "delete"}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            }
        </>
    );
}

export default Career;
