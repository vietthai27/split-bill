import { Avatar, Box, Chip, Collapse, Divider, IconButton, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useDispatch } from "react-redux";
import { setLoading } from "../../App/appSlice";
import { host } from "../../App/ulti";


function BillHistory() {

    const [billList, setBillList] = useState([])
    const [billById, setBillById] = useState({})
    const dispatch = useDispatch()

    useEffect(() => {
        getBillHistory()
    }, [])

    const getBillHistory = async () => {
        try {
            dispatch(setLoading(true))
            const res = await fetch(host + "/api/bill/bill-history", {
                method: "GET"
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Server Error:", errorText);
                alert(`Error get bill history: ${res.status} ${res.statusText}`);
                return;
            }

            const data = await res.json();
            setBillList(data)


        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Could not connect to the backend server.");
        } finally {
            dispatch(setLoading(false))
        }
    }

    const getBillById = async (id) => {
        try {
            dispatch(setLoading(true))
            const res = await fetch(host + "/api/bill/bill-by-id/" + id, {
                method: "GET"
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Server Error:", errorText);
                alert(`Error get bill by id: ${res.status} ${res.statusText}`);
                return;
            }

            const data = await res.json();
            setBillById(data)


        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Could not connect to the backend server.");
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleGetBillById = async (id) => {
        await getBillById(id)
        handleOpen()
    }

    const formatDateTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Asia/Ho_Chi_Minh',
        };
        return new Intl.DateTimeFormat('vi-VN', options).format(date);
    };

    const cellFontSize = '0.7rem'

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70%',
        height: '80%',
        bgcolor: 'background.paper',
        borderRadius: '5px',
        boxShadow: 24,
        p: 4,
        overflowX: 'scroll'
    };

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // --- Hàm tiện ích (Tái sử dụng) ---

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return '0 đ';
        }
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const groupSettlements = (settlements) => {
        if (!settlements) return {};

        return settlements.reduce((acc, tx) => {
            const payer = tx.payerName;
            if (!acc[payer]) {
                acc[payer] = {
                    transactions: [],
                    totalOwed: 0,
                };
            }
            // Đảm bảo amount là số
            const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;

            acc[payer].transactions.push(tx);
            acc[payer].totalOwed += amount;
            return acc;
        }, {});
    };

    const [collapsedSettlementState, setCollapsedSettlementState] = useState({});

    // 1. Phân tích dữ liệu JSON (request và response)
    let parsedRequest = [];
    let parsedResponse = null;

    if (billById?.request) {
        try {
            parsedRequest = JSON.parse(billById.request);
        } catch (e) {
            console.error("Lỗi khi parse request JSON:", e);
        }
    }
    if (billById?.response) {
        try {
            parsedResponse = JSON.parse(billById.response);
        } catch (e) {
            console.error("Lỗi khi parse response JSON:", e);
        }
    }

    const groupedSettlements = parsedResponse?.settlements ? groupSettlements(parsedResponse.settlements) : {};

    const handleToggleSettlementCollapse = (payerName) => {
        setCollapsedSettlementState(prev => ({
            ...prev,
            [payerName]: !prev[payerName]
        }));
    };


    function stringAvatar(name) {
        return {
            sx: {
                bgcolor: stringToColor(name),
            },
            children: name?.[0]?.toUpperCase(),
        };
    }

    function stringToColor(str) {
        let hash = 0;

        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = "#";

        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xff;
            color += ("00" + value.toString(16)).slice(-2);
        }

        return color;
    }

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant='h5' sx={{ mb: 2 }} >Lịch sử hóa đơn</Typography>
            <Divider sx={{ mb: 3 }} />
            <TableContainer
                component={Paper}
                sx={{
                    overflowX: "auto",
                    maxWidth: "100%"
                }}
            >
                <Table
                    size="small"
                    aria-label="bill list table"
                    sx={{
                        minWidth: 300,
                        tableLayout: "fixed"   // IMPORTANT: forces shrink
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    fontSize: cellFontSize,
                                    fontWeight: "bold",
                                    width: { xs: "40%", sm: "45%" },   // smaller on mobile
                                    px: 1
                                }}
                            >
                                Tên hóa đơn
                            </TableCell>

                            <TableCell
                                sx={{
                                    fontSize: cellFontSize,
                                    fontWeight: "bold",
                                    width: { xs: "40%", sm: "45%" },
                                    px: 1,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                }}
                            >
                                Thời gian tạo
                            </TableCell>

                            <TableCell
                                sx={{
                                    fontSize: cellFontSize,
                                    fontWeight: "bold",
                                    width: { xs: "20%", sm: "10%" },
                                    textAlign: "center",
                                    px: 1
                                }}
                            >
                                Chi tiết
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {billList.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell sx={{ fontSize: cellFontSize, px: 1 }}>
                                    {row.billName}
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontSize: cellFontSize,
                                        px: 1,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}
                                >
                                    {formatDateTime(row.createdAt)}
                                </TableCell>

                                <TableCell
                                    onClick={() => handleGetBillById(row.id)}
                                    sx={{
                                        textAlign: "center",
                                        px: 1
                                    }}
                                >
                                    <RequestQuoteIcon color="primary" sx={{ fontSize: "1.5rem" }} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="bill-detail-modal-title" variant="h5" component="h2" gutterBottom align="center">
                        Hóa Đơn: {billById?.billName || 'N/A'}
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
                        Tạo lúc: {formatDateTime(billById?.createdAt)}
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    {/* --- Chi tiết Thanh toán (REQUEST) --- */}
                    <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                        Thành viên và thanh toán:
                    </Typography>
                    {parsedRequest.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>Không có dữ liệu thanh toán.</Typography>
                    ) : (
                        <Box sx={{ ml: 1 }}>
                            {parsedRequest.map((member, index) => (
                                <Box key={index} sx={{ mb: 1, p: 1, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 2 }}>
                                        <Avatar {...stringAvatar(member.name)} />
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                            {member.name}
                                        </Typography>
                                    </Box>
                                    {member.payments.length > 0 ? (
                                        <Box sx={{ ml: 2 }}>
                                            {member.payments.map((pay, pIndex) => (
                                                <Box>
                                                    <Typography key={pIndex} variant="body2">
                                                        - <b>{pay.paymentName || 'Khoản chi'} : </b> ** <u>{formatCurrency(parseFloat(pay.amount))}</u> **
                                                    </Typography>
                                                    <Divider sx={{ mb: 1.5 }}/>
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : (
                                        null
                                    )}
                                </Box>
                            ))}
                        </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* --- Kết quả Chia Tiền (RESPONSE) --- */}
                    <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                        Kết quả chia tiền:
                    </Typography>
                    {parsedResponse ? (
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Tổng Hóa Đơn: ** <b>{formatCurrency(parsedResponse.totalAmount)}</b> **
                            </Typography>

                            <Divider sx={{ my: 1 }} />

                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Tiền cần phải trả:
                            </Typography>

                            {/* Hiển thị chi tiết thanh toán bù trừ */}
                            {Object.entries(groupedSettlements).length > 0 ? (
                                Object.entries(groupedSettlements).map(([payerName, data]) => {
                                    const isGroupCollapsed = !!collapsedSettlementState[payerName];
                                    return (
                                        <Paper key={payerName} sx={{ mb: 1, p: 1, bgcolor: '#ffffffff' }}>
                                            <Box
                                                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                                onClick={() => handleToggleSettlementCollapse(payerName)}
                                            >
                                                <IconButton size="small" sx={{
                                                    transform: isGroupCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                                                    transition: 'transform 0.3s',
                                                    mr: 1
                                                }}>
                                                    <ChevronRightIcon />
                                                </IconButton>
                                                <Typography variant="body1">
                                                    <b>{payerName}</b> <em>cần trả :</em> <Chip color="error" label={<b>{formatCurrency(data.totalOwed)}</b>}></Chip>
                                                </Typography>
                                            </Box>

                                            <Collapse in={!isGroupCollapsed} timeout="auto" unmountOnExit>
                                                <Box sx={{ pl: 5, pt: 0.5 }}>
                                                    {data.transactions.map((tx, index) => (
                                                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>trả</Typography>
                                                            <Typography variant="body1" color="error">{formatCurrency(tx.amount)}</Typography>
                                                            <Typography variant="body2">cho</Typography>
                                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{tx.recipientName}</Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Collapse>
                                        </Paper>
                                    );
                                })
                            ) : (
                                <Typography variant="body2" color="success.main" sx={{ fontStyle: 'italic', ml: 2 }}>
                                    Không cần thanh toán bù trừ.
                                </Typography>
                            )}
                        </Box>
                    ) : (
                        <Typography color="error">Không tìm thấy kết quả chia tiền.</Typography>
                    )}
                </Box>
            </Modal>
        </Paper>
    )
}

export default BillHistory