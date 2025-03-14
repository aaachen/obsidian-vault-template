// https://github.com/saml-dev/obsidian-custom-js
class Time {
    /**
     * A simple conversion of moment time object to numerical representation in hours
     * 
     * @param {moment} time moment object
     * @param {boolean} isPreviousDay whether the time is a previous day from today
     * @returns hour representation, if it's from previous day, then it's negative offset from midnight
     */
    getHours(time, isPreviousDay = false) {
        const t = time.hour() + time.minute() / 60;
        if (isPreviousDay) {
            return -(24 - t)
        }
        return t;
    }

    /**
     * @param {number} value hours in numerical representation (24-hour time notation)
     */
    getHourAndMinute(value) {
        const hour = Math.floor(value);
        const hourStr = (hour < 0 ? 24 + hour : hour).toString();
        const minute = Math.round((value - hour) * 60);
        return `${hourStr.padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`; // Time format on the right axis
    }

    /**
     * @param {Array} hours an array of hours in numerical representation (24-hour time notation) or getHours output
     * @returns circularMean
     */
    circularMean(hours) {
        hours = hours.filter(h => h).map(h => h < 0 ? 24 + h : h);
        // Convert hours to radians
        // To convert from hours to degrees, we need to
        // multiply hour by 360/24 = 15.
        const radians = hours.map(hour => (hour * 15) * (Math.PI / 180)); // Convert to radians

        // Calculate the sum of sin and cos values
        const sinSum = radians.reduce((sum, rad) => sum + Math.sin(rad), 0);
        const cosSum = radians.reduce((sum, rad) => sum + Math.cos(rad), 0);

        // Calculate the circular mean using arctan2
        const meanRad = Math.atan2(sinSum, cosSum);

        // Convert the mean back to hours
        const meanHour = ((meanRad * (180 / Math.PI)) / 15) % 24;

        // Ensure the result is in the range [0, 24)
        return (meanHour + 24) % 24;
    }

}
