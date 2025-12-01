// CAHDeck.js - Third-party library for loading Cards Against Humanity decks
// From json-against-humanity project by Chris Hallberg
// https://github.com/crhallberg/json-against-humanity

class CAHDeck {
    /**
     * Hydrates compact JSON format into full card objects
     * Compact format saves space by storing card text separately from pack assignments
     */
    _hydrateCompact(json) {
        let packs = [];
        
        for (let pack of json.packs) {
            // Map white card indices to full card objects
            pack.white = pack.white.map((index) =>
                Object.assign(
                    {},
                    { text: json.white[index] },
                    { pack: packs.length },
                    pack.icon ? { icon: pack.icon } : {}
                )
            );
            
            // Map black card indices to full card objects
            pack.black = pack.black.map((index) =>
                Object.assign(
                    {},
                    json.black[index],
                    { pack: packs.length },
                    pack.icon ? { icon: pack.icon } : {}
                )
            );
            
            packs.push(pack);
        }
        
        return packs;
    }
    
    /**
     * Loads deck from either compact or full JSON format
     */
    async _loadDeck() {
        if (typeof this.compactSrc != "undefined") {
            let json = await fetch(this.compactSrc).then((data) => data.json());
            this.deck = this._hydrateCompact(json);
        } else if (typeof this.fullSrc != "undefined") {
            this.deck = await fetch(this.fullSrc).then((data) => data.json());
        } else {
            throw Error(
                "No source specified, please use CAHDeck.fromCompact(src) or CAHDeck.fromFull(src) to make your objects."
            );
        }
    }
    
    /**
     * Factory method to create CAHDeck from compact JSON
     */
    static async fromCompact(compactSrc) {
        let n = new CAHDeck();
        n.compactSrc = compactSrc;
        await n._loadDeck();
        return n;
    }
    
    /**
     * Factory method to create CAHDeck from full JSON
     */
    static async fromFull(fullSrc) {
        let n = new CAHDeck();
        n.fullSrc = fullSrc;
        await n._loadDeck();
        return n;
    }
    
    /**
     * Lists all packs with metadata
     */
    listPacks() {
        let packs = [];
        let id = 0;
        
        for (let { name, official, description, icon, white, black } of this.deck) {
            let pack = {
                id,
                name,
                official,
                description,
                counts: {
                    white: white.length,
                    black: black.length,
                    total: white.length + black.length,
                },
            };
            
            if (icon) {
                pack.icon = icon;
            }
            
            packs.push(pack);
            id += 1;
        }
        
        return packs;
    }
    
    /**
     * Gets a single pack by index
     */
    getPack(index) {
        return this.deck[index];
    }
    
    /**
     * Gets multiple packs by indexes
     * If no indexes provided, returns all packs
     */
    getPacks(indexes) {
        if (typeof indexes == "undefined") {
            indexes = Object.keys(this.deck);
        }
        
        let white = [];
        let black = [];
        
        for (let pack of indexes) {
            if (typeof this.deck[pack] != "undefined") {
                white.push(...this.deck[pack].white);
                black.push(...this.deck[pack].black);
            }
        }
        
        return { white, black };
    }
}

export { CAHDeck };
