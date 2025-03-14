
class Milestone {
    // customJS doesn't seem to allow module to module loading, copied from common.js
    toArray(obj) {
        if (!obj) {
            return obj;
        }
        return !Array.isArray(obj) ? [obj] : obj;
    }

    /**
     * 
     * @param {*} p a dataview page
     * @returns 
     */
    getMilestones = (p) => {
        const milestones = this.toArray(p.milestone) ?? [];
        // required key
        const targets = this.toArray(p.target) ?? new Array(milestones.length);
        const descs = this.toArray(p.desc) ?? new Array(milestones.length);
        const accomplished =
            this.toArray(p.accomplished) ?? new Array(milestones.length);

        return milestones.map((_, i) => ({
            effort: p.file.name,
            milestoneName: milestones[i],
            desc: descs[i],
            target: targets[i],
            accomplished: accomplished[i],
        }));
    };

}