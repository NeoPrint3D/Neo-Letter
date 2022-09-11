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
                marginTop: "1rem"
            }}
            autoClose={1000}
            toastStyle={{
                width: "fit",
                textAlign: "center",
                fontSize: "1.25rem",
                fontFamily: "Crete Round , serif",
                backgroundColor: 'rgba(2, 48, 71, 0.6)',
                backdropFilter: "blur(40px)",
                color: '#fff',
                borderRadius: "10px",
                padding: ".5rem",
                marginBottom: "1rem"
            }}
        />
    );
}