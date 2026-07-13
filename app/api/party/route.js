import { getPartyItems, savePartyItems } from '../../admin/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const items = getPartyItems();
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json(
            { error: 'Տվյալները չհաջողվեց բեռնել' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const newItem = await request.json();
        const items = getPartyItems();

        if (items.find(p => p.id === newItem.id)) {
            return NextResponse.json(
                { error: 'Այս ID-ով ապրանք արդեն կա' },
                { status: 400 }
            );
        }

        if (!newItem.image) {
            newItem.image = 'party-placeholder';
        }

        items.push(newItem);
        savePartyItems(items);

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Տվյալները չհաջողվեց պահպանել' },
            { status: 500 }
        );
    }
}