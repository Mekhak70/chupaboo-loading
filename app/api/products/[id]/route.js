import { getProducts, saveProducts } from '../../../admin/lib/db';
import { NextResponse } from 'next/server';

// GET - Ստանալ մեկ ապրանք
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const products = getProducts();
        const product = products.find(p => p.id === id);

        if (!product) {
            return NextResponse.json(
                { error: 'Ապրանքը չի գտնվել' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json(
            { error: 'Տվյալները չհաջողվեց բեռնել' },
            { status: 500 }
        );
    }
}

// PUT - Թարմացնել ապրանքը
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const updatedProduct = await request.json();
        const products = getProducts();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) {
            return NextResponse.json(
                { error: 'Ապրանքը չի գտնվել' },
                { status: 404 }
            );
        }

        // Ստուգել ID-ի կրկնությունը (բացի իրենից)
        const duplicate = products.find((p, i) => p.id === updatedProduct.id && i !== index);
        if (duplicate) {
            return NextResponse.json(
                { error: 'Այս ID-ով ապրանք արդեն կա' },
                { status: 400 }
            );
        }

        products[index] = { ...updatedProduct, id };
        saveProducts(products);

        return NextResponse.json(products[index]);
    } catch (error) {
        return NextResponse.json(
            { error: 'Տվյալները չհաջողվեց թարմացնել' },
            { status: 500 }
        );
    }
}

// DELETE - Ջնջել ապրանքը
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const products = getProducts();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) {
            return NextResponse.json(
                { error: 'Ապրանքը չի գտնվել' },
                { status: 404 }
            );
        }

        const deleted = products.splice(index, 1)[0];
        saveProducts(products);

        return NextResponse.json(deleted);
    } catch (error) {
        return NextResponse.json(
            { error: 'Տվյալները չհաջողվեց ջնջել' },
            { status: 500 }
        );
    }
}