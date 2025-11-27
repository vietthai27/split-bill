import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import BillOneTime from './BillOneTime';
import BillHistory from './BillHistory';
import HistoryIcon from '@mui/icons-material/History';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function BillTab() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label={
                        <Box display="flex" alignItems="center" gap={1}>
                            <span>Tính tiền</span>
                            <AttachMoneyIcon fontSize="small" />
                        </Box>
                    } {...a11yProps(0)} />
                    <Tab label={
                        <Box display="flex" alignItems="center" gap={1}>
                            <span>Lịch sử</span>
                            <HistoryIcon fontSize="small" />
                        </Box>
                    } {...a11yProps(1)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <BillOneTime />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <BillHistory />
            </CustomTabPanel>
        </Box>
    );
}