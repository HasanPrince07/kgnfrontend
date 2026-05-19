import { toast } from "react-toastify";
import Sidebar from "../common/Sidebar";
import { useCallback, useEffect, useState } from "react";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Query() {

    const [data, setData] = useState([]);
    const [query, setQuery] = useState({ name: "", email: "", phone: "", message: "", from: "KGN Electrodes <info@kgnelectrodes.com>", subject: "", body: "", image: "" });
    const [counts, setCounts] = useState({ total: 0, replied: 0, unreplied: 0 });
    const [select, setSelect] = useState("All Queries");
    const [modal, setModal] = useState({ action: false, delete: false, multi: false });
    const [id, setId] = useState("");
    const [selectedId, setSelectedId] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState({
        table: false,
        modal: false,
        form: false
    });
    const [error, setError] = useState(false);

    const handleFetch = useCallback(async () => {
        setLoading(prev => ({ ...prev, table: true }));
        try {
            const res = await fetch(`${BASE_URL}/admin/fetchquery/${select}`,{
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
                setCounts(resData.stats);
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during fetch query data:", error);
        } finally {
            setLoading(prev => ({ ...prev, table: false }));
        }
    }, [select]);

    useEffect(() => {
        handleFetch();
    }, [handleFetch]);

    const handleForm = async (e) => {
        e.preventDefault();
        const { email, from, subject, body, image } = query;
        if (!email.trim() || !from.trim() || !subject.trim() || !body.trim()) {
            setError(true);
            return
        }
        const formdata = new FormData();
        formdata.append("email", email);
        formdata.append("from", from);
        formdata.append("subject", subject);
        formdata.append("body", body);
        formdata.append("image", image.file);
        setLoading(prev => ({ ...prev, form: true }));
        try {
            const res = await fetch(`${BASE_URL}/admin/replyquery/${id}`, {
                method: "POST",
                credentials: "include",
                body: formdata
            });
            const resData = await res.json();
            if (res.ok) {
                handleFetch();
                setError(false);
                setModal(prev => ({ ...prev, action: false }));
                toast(resData.message, { type: "success" });
            } else {
                toast(resData.message, { type: "error" });
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during reply query:", error);
        } finally {
            setLoading(prev => ({ ...prev, form: false }));
        }
    }

    const fetchByID = useCallback(async (id) => {
        setLoading(prev => ({ ...prev, modal: true }));
        try {
            const res = await fetch(`${BASE_URL}/admin/fetchquerybyid/${id}`,{
                credentials: "include"
            });
            const resData = await res.json();
            if (!res.ok) {
                toast(resData.message, { type: "error" });
            } else {
                setQuery((prev) => ({
                    ...prev,
                    name: resData.data.name,
                    email: resData.data.email,
                    phone: resData.data.phone,
                    message: resData.data.message,
                }));
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during fetch query data by id:", error);
        } finally {
            setLoading(prev => ({ ...prev, modal: false }));
        }
    }, []);

    const handleDelete = async () => {
        setLoading(prev => ({ ...prev, form: true }));
        try {
            const res = await fetch(`${BASE_URL}/admin/deletequery/${id}`,{
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
            console.log("Error during single delete query data:", error);
        } finally {
            setLoading(prev => ({ ...prev, form: false }));
        }
    }

    const handleMultiDelete = async () => {
        setLoading(prev => ({ ...prev, form: true }));
        try {
            const res = await fetch(`${BASE_URL}/admin/multideletequery`, {
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
            console.log("Error during multi delete query data:", error);
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
        setQuery({
            from: "",
            subject: "",
            body: "",
            image: ""
        });
        setId("empty");
        setError(false);
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

    const handleSelectedImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const imageObj = {
            file,
            preview: URL.createObjectURL(file),
        };
        setQuery({ ...query, image: imageObj });
    }

    const handleRemove = (src) => {
        if (src?.preview) URL.revokeObjectURL(src.preview);
        setQuery({ ...query, image: "" });
    };

    return (
        <>
            <main id="admin-section">
                <div className="container-fluid">
                    <div className="row">
                        <Sidebar />
                        <div className="col-sm-9 col-12 admin-div">
                            <h2 className="fw-bold text-center text-uppercase mt-4 mb-0">query management page</h2>
                            <div className="d-flex justify-content-between align-items-center my-4">
                                <div>
                                    <select className="shadow-none form-select" value={select} onChange={(e) => setSelect(e.target.value)} aria-label="Filter Queries">
                                        <option>All Queries</option>
                                        <option>Replied Queries</option>
                                        <option>Unreplied Queries</option>
                                    </select>
                                </div>
                                <div className="d-flex">
                                    <button onClick={handleSelectAll} className="btn1 text-uppercase rounded-0 fw-bold px-4">{selectAll ? "disselect all" : "select all"}</button><button disabled={selectedId.length === 0} onClick={handleDeleteSelected} className="btn text-uppercase rounded-0 fw-bold px-4">delete selected</button>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table text-center table-bordered align-middle">
                                    <thead className="align-middle text-uppercase">
                                        <tr>
                                            <th>s.no.</th>
                                            <th>Full Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Message</th>
                                            <th>action</th>
                                            <th>select</th>
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
                                                        <td>{dt.name}</td>
                                                        <td>{dt.email}</td>
                                                        <td>{dt.phone}</td>
                                                        <td>{dt.message}</td>
                                                        <td><button onClick={() => handleModal(dt._id)} disabled={dt.status === "replied"} className="btn fw-bold text-uppercase btn1 rounded-0 px-4">{dt.status === "replied" ? "replied" : "reply"}</button><button onClick={() => handleDeleteModal(true, dt._id)} className="btn fw-bold text-uppercase btn2 rounded-0 px-4">delete</button></td>
                                                        <td><input type="checkbox" checked={selectedId.includes(dt._id)} onChange={() => handleSelect(dt._id)} aria-label={`Select ${dt._id}`} /></td>
                                                    </tr>
                                                ))
                                        }
                                    </tbody>
                                </table>
                                <div className="d-flex justify-content-end">
                                    <ul>
                                        <li className="d-inline-block border px-5 py-1">Total: {counts.total}</li>
                                        <li className="d-inline-block border px-5 py-1">Replied: {counts.replied}</li>
                                        <li className="d-inline-block border px-5 py-1">Unreplied: {counts.unreplied}</li>
                                    </ul>
                                </div>
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
                                <h3 className="text-center text-uppercase fw-bold mb-sm-4 mb-3">query section</h3>
                                <div className="modal-body px-3">
                                    {loading.modal ? <><div className="modal-spinner mx-auto"></div></> :
                                        <form onSubmit={(e) => handleForm(e)}>
                                            <label className="mb-1">To</label>
                                            <input value={query.email} disabled type="email" className="form-control shadow-none rounded-0 mb-3" />
                                            <label className="mb-1">From</label>
                                            <input value={query.from} disabled type="email" onChange={(e) => setQuery((prev) => ({ ...prev, from: e.target.value }))} className={`form-control rounded-0 shadow-none ${error && !query.from.trim() ? "error-input" : ""}`} />
                                            <p className="my-1">{error && query.from.trim().length === 0 ? "From is required" : ""}</p>
                                            <label className="mb-1">Subject</label>
                                            <input value={query.subject} type="text" onChange={(e) => setQuery((prev) => ({ ...prev, subject: e.target.value }))} className={`form-control rounded-0 shadow-none ${error && !query.subject.trim() ? "error-input" : ""}`} />
                                            <p className="my-1">{error && query.subject.trim().length === 0 ? "Subject is required" : ""}</p>
                                            <label className="mb-1">Body</label>
                                            <textarea value={query.body} rows={3} onChange={(e) => setQuery((prev) => ({ ...prev, body: e.target.value }))} className={`form-control rounded-0 shadow-none ${error && !query.body.trim() ? "error-input" : ""}`} ></textarea>
                                            <p className="my-1">{error && query.body.trim().length === 0 ? "Body is required" : ""}</p>
                                            <label className="mb-1">Image</label>
                                            <input onChange={handleSelectedImage} type="file" className="form-control shadow-none rounded-0" />
                                            {query.image ?
                                                <div className="row mt-2 mb-3 align-items-center gy-2">
                                                    <div className="col-sm-4 col-6 position-relative">
                                                        <img
                                                            className="w-100"
                                                            src={query.image.preview}
                                                            alt="not-found"
                                                        />
                                                        <p
                                                            onClick={() => handleRemove(query.image)}
                                                            className="text-center close-button m-0"
                                                        >
                                                            close
                                                        </p>
                                                    </div>
                                                </div>
                                                : ""}
                                            <button type="submit" disabled={loading.form} className="btn text-uppercase fw-bold shadow-none form-control rounded-0 mt-2">{loading.form ? <div className="spinner mx-auto"></div> : "reply"}</button>
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

export default Query;
