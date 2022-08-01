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
                width: "100%",
                textAlign: "center",
                fontSize: "1.5rem",
                fontFamily: "Crete Round , serif",
                backgroundColor: '#023047',
                color: '#fff',
            }}
        />
    );
}