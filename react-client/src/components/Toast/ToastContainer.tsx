import { ToastContainer } from "react-toastify";

export default function AppToastContainer() {
    return (
        <ToastContainer
            position="top-center"
            pauseOnHover={false}
            pauseOnFocusLoss={false}
            limit={2}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
            autoClose={1000}
            toastStyle={{
                backgroundColor: '#023047',
                color: '#fff',
            }}
        />
    );
}