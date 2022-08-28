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
                textAlign: "center",
                fontSize: "1rem",
                fontFamily: "Crete Round , serif",
                backgroundColor: 'rgba(2, 48, 71, 0.3)',
                backdropFilter: "blur(20px)",
                color: '#fff',
            }}
        />
    );
}