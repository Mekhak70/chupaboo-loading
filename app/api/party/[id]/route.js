import { getPartyItems, savePartyItems } from '../../../admin/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const items = getPartyItems();
        const item = items.find(p => p.id === id);

        if (!item) {
            return NextResponse.json(
                { error: 'Ապրանքը չի գտնվել' },
                { status: 404 }
            );
        }

        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json(
            { error: 'Տվյալները չհաջողվեց բեռնել' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const updatedItem = await request.json();
        const items = getPartyItems();
        const index = items.findIndex(p => p.id === id);

        if (index === -1) {
            return NextResponse.json(
                { error: 'Ապրանքը չի գտնվել' },
                { status: 404 }
            );
        }

        const duplicate = items.find((p, i) => p.id === updatedItem.id && i !== index);
        if (duplicate) {
            return NextResponse.json(
                { error: 'Այս ID-ով ապրանք արդեն կա' },
                { status: 400 }
            );
        }

        items[index] = { ...updatedItem, id };
        savePartyItems(items);

        return NextResponse.json(items[index]);
    } catch (error) {
        return NextResponse.json(
            { error: 'Տվյալները չհաջողվեց թարմացնել' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const items = getPartyItems();
        const index = items.findIndex(p => p.id === id);

        if (index === -1) {
            return NextResponse.json(
                { error: 'Ապրանքը չի գտնվել' },
                { status: 404 }
            );
        }

        const deleted = items.splice(index, 1)[0];
        savePartyItems(items);

        return NextResponse.json(deleted);
    } catch (error) {
        return NextResponse.json(
            { error: 'Տվյալները չհաջողվեց ջնջել' },
            { status: 500 }
        );
    }
}