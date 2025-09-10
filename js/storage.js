class Storage {
    static saveRPs(rps) {
        localStorage.setItem('rps', JSON.stringify(rps));
    }

    static getRPs() {
        return JSON.parse(localStorage.getItem('rps')) || [];
    }

    static savePartners(partners) {
        localStorage.setItem('partners', JSON.stringify(partners));
    }

    static getPartners() {
        return JSON.parse(localStorage.getItem('partners')) || [];
    }

    static exportData() {
        const data = {
            rps: this.getRPs(),
            partners: this.getPartners()
        };
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rp-tracker-data.json';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    static importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.rps) this.saveRPs(data.rps);
            if (data.partners) this.savePartners(data.partners);
            return true;
        } catch (e) {
            console.error('Erreur lors de l\'import:', e);
            return false;
        }
    }

    static clearData() {
        localStorage.clear();
    }
}