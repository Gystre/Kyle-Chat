// date could be coming in valid date object string OR just a # :/
export const convertStringToDate = (date: string) => {
    const theDate = new Date(parseInt(date));

    return theDate.toLocaleString();
};
