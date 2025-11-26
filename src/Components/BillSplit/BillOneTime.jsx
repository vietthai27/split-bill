import { Button, Paper, Typography, Divider, IconButton, Collapse } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PaidIcon from '@mui/icons-material/Paid';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddCardIcon from '@mui/icons-material/AddCard';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../App/appSlice';
import { host } from '../../App/ulti';

export default function BillOneTime() {

    const [memberList, setMemberList] = useState([]);
    const [memberName, setMemberName] = useState('');
    const [billName, setBillName] = useState('');
    const [summary, setSummary] = useState(null);
    const [collapsedSettlementState, setCollapsedSettlementState] = useState({});
    const [memberListCollapsed, setMemberListCollapsed] = useState(false);

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return 'NaN đ';
        }
        return new Intl.NumberFormat('vi-VN', {
            currency: 'VND',
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
            acc[payer].transactions.push(tx);
            acc[payer].totalOwed += tx.amount;
            return acc;
        }, {});
    };

    const handleToggleSettlementCollapse = (payerName) => {
        setCollapsedSettlementState(prev => ({
            ...prev,
            [payerName]: !prev[payerName]
        }));
    };

    const handleAddMember = () => {
        if (!memberName.trim()) return;

        setMemberList([
            ...memberList,
            { name: memberName, payments: [] }
        ]);
        setMemberName('');
        setSummary(null);
    };

    const handleAddPayment = (memberIndex) => {
        const updatedList = [...memberList];
        updatedList[memberIndex].payments.push({
            paymentName: '',
            amount: ''
        });
        setMemberList(updatedList);
        setSummary(null);
    };

    const handleRemovePayment = (memberIndex, payIndex) => {
        const updatedList = [...memberList];
        updatedList[memberIndex].payments.splice(payIndex, 1);
        setMemberList(updatedList);
        setSummary(null);
    };

    const handleChangePayment = (memberIndex, payIndex, field, value) => {
        const updatedList = [...memberList];
        updatedList[memberIndex].payments[payIndex][field] = value;
        setMemberList(updatedList);
        setSummary(null);
    };

    const removeMember = (idx) => {
        setMemberList(memberList.filter((_, i) => i !== idx));
        setSummary(null);
    };

    const dispatch = useDispatch()

    const getData = async () => {
        setSummary(null);

        try {
            dispatch(setLoading(true))
            const res = await fetch(host + "/api/bill/calculate?bill-name=" + billName, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(memberList)
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Server Error:", errorText);
                alert(`Error calculating bill: ${res.status} ${res.statusText}`);
                return;
            }

            const data = await res.json();
            setSummary(data);

        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Could not connect to the backend server.");
        } finally {
            dispatch(setLoading(false))
        }
    };

    

    return (
        <Paper sx={{ p: 2 }}>
            <TextField
                label="Tên hóa đơn"
                variant="standard"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
                sx={{ flexGrow: 1, margin: 2 }}
            />

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-around', mb: 3 }}>
                <TextField
                    label="Thành viên"
                    variant="filled"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    sx={{ flexGrow: 1 }}
                />
                <Button variant="contained" onClick={handleAddMember}>
                    <PersonAddIcon />
                </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />


            <Box>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        mb: 2,
                        cursor: 'pointer'
                    }}
                    onClick={() => { setMemberListCollapsed(!memberListCollapsed) }}
                >
                    <IconButton
                        size="small"
                        // Logic sửa lỗi: rotate(0deg) khi đóng (memberListCollapsed=true), rotate(90deg) khi mở (memberListCollapsed=false)
                        sx={{
                            transform: memberListCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                            transition: 'transform 0.3s',
                            mr: 1
                        }}
                    >
                        <ChevronRightIcon />
                    </IconButton>
                    <Typography variant='h5'>Danh sách thành viên</Typography>

                </Box>

                {memberList.length === 0 ? (
                    <Typography color="text.secondary">Chưa có thành viên.</Typography>
                ) : (
                    <Collapse in={!memberListCollapsed} timeout="auto" unmountOnExit>
                        {memberList.map((member, memberIndex) => {
                            return (
                                <Paper key={memberIndex} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0' }}>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, borderBottom: '1px dotted #ccc', pb: 1 }}>
                                        <AccountCircleIcon color="primary" />
                                        <Typography variant="h6" sx={{ flexGrow: 1 }}>{member.name}</Typography>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => handleAddPayment(memberIndex)}
                                        >
                                            <AddCardIcon fontSize="small" />
                                        </Button>

                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            onClick={() => removeMember(memberIndex)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </Button>
                                    </Box>

                                    <Box>
                                        {member.payments.length === 0 && (
                                            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                                                Chưa có thanh toán.
                                            </Typography>
                                        )}

                                        {member.payments.map((pay, payIndex) => (
                                            <Box key={payIndex} sx={{ display: 'flex', gap: 2, mb: 1, ml: 4, alignItems: 'center' }}>
                                                <TextField
                                                    label="Khoản"
                                                    variant="standard"
                                                    size="small"
                                                    value={pay.paymentName}
                                                    onChange={(e) => handleChangePayment(memberIndex, payIndex, "paymentName", e.target.value)}
                                                />

                                                <TextField
                                                    label="Tiền"
                                                    variant="standard"
                                                    size="small"
                                                    type="number"
                                                    value={pay.amount}
                                                    onChange={(e) => handleChangePayment(memberIndex, payIndex, "amount", e.target.value)}
                                                    sx={{ maxWidth: 120 }}
                                                />

                                                <Button
                                                    variant="text"
                                                    color="error"
                                                    onClick={() => handleRemovePayment(memberIndex, payIndex)}
                                                    sx={{ minWidth: '30px' }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </Button>
                                            </Box>
                                        ))}
                                    </Box>
                                </Paper>
                            );
                        })}
                        {memberList.length > 0 && (
                            <Box sx={{ textAlign: "center", mt: 3, mb: 3 }}>
                                <Button endIcon={<PaidIcon/>} sx={{ color: 'white', margin: 2, padding: 1 }} className="button-85" onClick={getData}>
                                    Chia tiền
                                </Button>
                            </Box>
                        )}
                    </Collapse>
                )}


            </Box>

            {summary && (
                <Paper sx={{ p: 3, mt: 4, bgcolor: '#f5f5f5' }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Kết quả
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    <Typography variant="h6" color="primary">
                        Tổng thanh toán: {formatCurrency(summary.totalAmount)} đ
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" gutterBottom>
                        Trả tiền:
                    </Typography>

                    {summary.settlements && summary.settlements.length > 0 ? (
                        <Box>
                            {Object.entries(groupSettlements(summary.settlements)).map(([payerName, data]) => {
                                const isGroupCollapsed = !!collapsedSettlementState[payerName];

                                return (
                                    <Paper key={payerName} sx={{ mb: 2, p: 1, bgcolor: 'white' }}>
                                        <Box
                                            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', p: 1 }}
                                            onClick={() => handleToggleSettlementCollapse(payerName)}
                                        >
                                            <IconButton
                                                size="small"
                                                sx={{
                                                    transform: isGroupCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                                                    transition: 'transform 0.3s',
                                                    mr: 1
                                                }}
                                            >
                                                <ChevronRightIcon />
                                            </IconButton>
                                            <Typography variant="body1">
                                                <b>{payerName}</b> <em>còn nợ:</em> {formatCurrency(data.totalOwed)} đ
                                            </Typography>
                                        </Box>

                                        <Collapse in={!isGroupCollapsed} timeout="auto" unmountOnExit>
                                            <Box sx={{ pl: 5, pt: 1 }}>
                                                {data.transactions.map((tx, index) => (
                                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>trả</Typography>
                                                        <Typography variant="body1" color="error" sx={{ fontWeight: 'bold' }}>{formatCurrency(tx.amount)} đ </Typography>
                                                        <Typography variant="body2">cho</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{tx.recipientName}</Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Collapse>
                                    </Paper>
                                );
                            })}
                        </Box>
                    ) : (
                        <Typography variant="body1" color="success.main" sx={{ fontStyle: 'italic' }}>
                            ✅ Everyone is settled! (Or no payments were recorded).
                        </Typography>
                    )}

                </Paper>
            )}
        </Paper>
    );
}