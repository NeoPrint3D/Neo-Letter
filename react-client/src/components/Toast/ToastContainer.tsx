import { ToastContainer } from "react-toastify";

export default function AppToastContainer() {
    return (
        <ToastContainer
            position="top-center"
            pauseOnHover={false}
            pauseOnFocusLoss={false}
            limit={3}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
            toastStyle={{
                backgroundColor: '#023047',
                color: '#fff',
            }}
        />
    );
}