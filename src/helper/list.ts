import { useState } from 'react';

export default function <T>() : [T[], (...items: T[]) => void, (...items: T[] | [(arg0: T) => boolean]) => void, (oldItem: T | ((arg0: T) => boolean), newItem: T) => void] {
    const [list, setList] = useState<T[]>(<T[]>[]);

    const addToList = (...items: T[]) => {
        setList(<T[]>[...list, ...items]);
    };
    function isFunc(arg: T | ((arg0: T) => boolean)): arg is ((arg0: T) => boolean) {
        return typeof arg === "function";
    }
    const removeFromList = (...items: T[] | [(arg0: T) => boolean]) => {
        if (items.length == 1) {
            const firstItem = items[0];
            if (isFunc(firstItem)) {
                setList(list.filter((f) => !firstItem(f)));
            }
        }
        const spliced = items.reduce((newList, f) => {
            const index = newList.findIndex((c) => c === f);
            if (index == -1) {
                return newList;
            }
            return newList.toSpliced(index, 1);
        }, list);
        setList(spliced);
    };
    const replaceItemInList = (oldItem: T | ((arg0: T) => boolean), newItem: T) => {
        const searchFunction: ((arg0: T) => boolean) = isFunc(oldItem) ? oldItem : (c: T) => c === oldItem;
        const index = list.findIndex(searchFunction);
        if (index != -1) {
            setList(list.toSpliced(index, 1, newItem));
        }
    };

    return [list, addToList, removeFromList, replaceItemInList];
}