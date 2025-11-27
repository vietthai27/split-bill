import { CircularProgress } from "@mui/material"

function Loading() {
    return (
        <div className="loading-container">
            <CircularProgress sx={{color: '#12b76e'}} className="loading"/>
        </div>

    )
}

export default Loading