

export const parseAsUTC = (dateStr) => {
    if (!dateStr) return 0;

    
    if (typeof dateStr === 'number') {
        
        if (dateStr < 100000000000) return dateStr * 1000;
        return dateStr;
    }

    
    if (typeof dateStr === 'string') {
        
        if (dateStr.endsWith('Z') || dateStr.includes('+') || (dateStr.includes('-') && dateStr.lastIndexOf('-') > 10)) {
            return new Date(dateStr).getTime();
        }

        
        
        return new Date(dateStr + 'Z').getTime();
    }

    
    return new Date(dateStr).getTime();
};


export const getNowUTC = () => {
    return Date.now();
};
