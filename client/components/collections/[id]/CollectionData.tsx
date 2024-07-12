"use client";

import {
    getCollection,
    removeGame,
} from "@/app/api/collections/collectionsApi";
import ErrorMessage from "@/components/shared/ErrorMessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRightIcon, TrashIcon } from "@radix-ui/react-icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next-nprogress-bar";
import Image from "next/image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import useSWR from "swr";

const CollectionData = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const uid = session?.user._id;
    const params = useParams();
    const collid = params.id as string;

    const {
        data: colldata,
        isLoading,
        error,
        mutate,
    } = useSWR(
        uid && `/user/collection?uid=${uid}&collid=${collid}`,
        getCollection,
        { revalidateOnFocus: false }
    );
    const games = colldata?.result?.games;

    if (isLoading)
        return (
            <div>
                <div className="text-2xl font-semibold">Collection</div>
                <div className="mt-3 mx-auto">Loading...</div>
            </div>
        );
    if (error) return <ErrorMessage message={error.message} />;

    const handleRemove = async (
        e: React.MouseEvent<HTMLElement>,
        slug: string
    ) => {
        e.stopPropagation();
        try {
            const data = await removeGame({
                userId: uid!,
                collectionId: collid,
                slug,
            });
            toast.success(data.message);
            mutate();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const openGame = (slug: string) => {
        router.push("/game/" + slug);
    };

    const gamesList = games?.map((game: any) => (
        <li key={game.slug}>
            <Card
                onClick={() => openGame(game.slug)}
                className="relative group h-[304px] w-[200px] bg-slate-200 dark:bg-slate-900 border-0 drop-shadow-md dark:border"
            >
                <Button
                    variant="destructive"
                    size="icon"
                    className="absolute rounded-full top-1 right-1 z-30 invisible group-hover:visible"
                    onClick={(e) => handleRemove(e, game.slug)}
                >
                    <TrashIcon className="h-5 w-5" />
                </Button>
                <CardContent className="p-0 h-[267px] overflow-hidden rounded-xl">
                    <Image
                        src={game.coverUrl || "/cover-missing.jpg"}
                        width={220}
                        height={294}
                        quality={100}
                        className="object-cover w-[200px] h-[267px] hover:scale-105 hover:origin-center duration-300 ease-in-out"
                        draggable="false"
                        alt="Game Cover"
                    />
                </CardContent>
                <CardHeader className="grid p-0 px-3 h-[36px]">
                    <CardTitle className="my-auto leading-5 overflow-hidden text-ellipsis whitespace-nowrap text-center">
                        {game.name}
                    </CardTitle>
                </CardHeader>
            </Card>
        </li>
    ));

    return (
        <div className="mb-6">
            <h3 className="text-xl font-semibold">
                {colldata?.result.collection}
                <ChevronRightIcon className="inline h-6 w-6 mb-1" />
            </h3>
            <hr className="mt-2 mb-4" />
            <ul className="flex justify-center flex-wrap gap-4">
                {session && !isLoading && gamesList?.length > 0 ? (
                    gamesList
                ) : (
                    <ErrorMessage
                        message={"Go search and add games in this collection."}
                    />
                )}
            </ul>
        </div>
    );
};

export default CollectionData;
